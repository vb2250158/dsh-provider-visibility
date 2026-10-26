// src/index.ts
import { Service } from "@deepseek-ai/cordis";

// src/redirect-runtime.ts
import { createUserMessage, boundContextSummary } from "@deepseek-ai/dsh-llm";

// src/redirect-history.ts
import { z } from "zod";

// src/redirect-rules.ts
function validateRedirectRules(rules) {
  const sources = /* @__PURE__ */ new Set();
  for (const rule of rules) {
    if (![rule.sourceProvider, rule.targetProvider, rule.targetModel].every((value) => value.trim().length > 0) || rule.sourceModel !== void 0 && rule.sourceModel.trim().length === 0) throw new Error("redirect.empty");
    const key = JSON.stringify([rule.sourceProvider, rule.sourceModel ?? null]);
    if (sources.has(key)) throw new Error("redirect.duplicate");
    sources.add(key);
    if (rule.sourceProvider === rule.targetProvider && (rule.sourceModel === void 0 || rule.sourceModel === rule.targetModel)) {
      throw new Error("redirect.self");
    }
  }
  return rules;
}
function redirectRoute(source, rules) {
  const rule = rules.find((rule2) => rule2.sourceProvider === source.provider && rule2.sourceModel === source.model) ?? rules.find((rule2) => rule2.sourceProvider === source.provider && rule2.sourceModel === void 0);
  return rule === void 0 ? source : { provider: rule.targetProvider, model: rule.targetModel };
}
function sameRoute(left, right) {
  return left != null && right != null && left.provider === right.provider && left.model === right.model;
}

// src/redirect-history.ts
var REDIRECT_PRODUCER = "dsh-provider-visibility";
var routeSchema = z.object({ provider: z.string().min(1), model: z.string().min(1) });
var redirectRecordSchema = z.object({ version: z.literal(1), from: routeSchema, to: routeSchema });
var historySchema = z.record(z.string(), redirectRecordSchema);
var stateSchema = z.object({ current: redirectRecordSchema.nullable(), messages: historySchema });
var runningSchema = z.object({ turn: z.number(), step: z.number(), record: redirectRecordSchema.nullable() }).nullable();
function foldRedirectHistory(state, event) {
  if (event.type === "step/start") return { ...state, current: null };
  if (event.type === "user/message" && event.data.source.kind === `plugin:${REDIRECT_PRODUCER}`) {
    const block = event.data.content[0];
    if (block?.type !== "text") return state;
    let value;
    try {
      value = JSON.parse(block.text);
    } catch {
      return state;
    }
    const parsed = redirectRecordSchema.safeParse(value);
    return parsed.success ? { ...state, current: parsed.data } : state;
  }
  if (event.type !== "assistant/message" || state.current === null) return state;
  const source = event.data.message.source;
  if (source.kind !== "model" || !sameRoute(source, state.current.to)) return state;
  return { ...state, messages: { ...state.messages, [event.data.message.id]: state.current } };
}
var redirectHistoryProjection = {
  key: "modelRedirects",
  stateSchema,
  stateVersion: 1,
  init: () => ({ current: null, messages: {} }),
  apply: foldRedirectHistory,
  wire: { viewSchema: historySchema, view: (state) => state.messages }
};
var runningRedirectProjection = {
  key: "runningModelRedirect",
  stateSchema: runningSchema,
  stateVersion: 1,
  init: () => null,
  apply: (state, event) => {
    if (event.type === "step/start") return { turn: event.data.turn, step: event.data.step, record: null };
    if (state === null) return null;
    const folded = foldRedirectHistory({ current: state.record, messages: {} }, event);
    return folded.current === state.record ? state : { ...state, record: folded.current };
  },
  wire: { viewSchema: runningSchema, view: (state) => state }
};

// src/redirect-runtime.ts
async function installRedirects(ctx, getRules) {
  if (ctx.agentLoop.modelResolutionVersion !== 1) throw new Error("Model redirects require a DSH driver with agent/resolve-model before step preparation");
  await ctx.sessionProjections.register(redirectHistoryProjection);
  await ctx.sessionProjections.register(runningRedirectProjection);
  const prepared = /* @__PURE__ */ new WeakMap();
  ctx.on("agent/resolve-model", async ({ agent, sourceSelection, signal }, next) => {
    const rules = [...getRules()];
    validateRedirectRules(rules);
    const selected = await next();
    signal.throwIfAborted();
    const from = { provider: selected.provider, model: selected.model };
    const to = redirectRoute(from, rules);
    if (sameRoute(from, to)) {
      prepared.delete(agent);
      return selected;
    }
    const effective = { ...selected, ...to };
    await ctx.llm.resolveCallConfig(effective, signal);
    signal.throwIfAborted();
    const current = agent.model.current();
    if (sameRoute(current, sourceSelection) && current?.reasoningEffort === sourceSelection.reasoningEffort) {
      agent.model.select(sourceSelection);
    }
    prepared.set(agent, { version: 1, from, to });
    return effective;
  }, { prepend: true });
  ctx.on("agent/request", async ({ agent, signal }, next) => {
    const proposed = await next();
    signal.throwIfAborted();
    const record = prepared.get(agent);
    if (record === void 0) return proposed;
    agent.session.append("user/message", createUserMessage({
      content: [{ type: "text", text: JSON.stringify(record) }],
      source: {
        kind: `plugin:${REDIRECT_PRODUCER}`,
        form: "notice",
        summary: boundContextSummary(`\u6A21\u578B\u91CD\u5B9A\u5411\uFF1A${record.from.provider}/${record.from.model} \u2192 ${record.to.provider}/${record.to.model}`)
      }
    }), { surfaceOp: "append" });
    return proposed;
  }, { prepend: true });
}

// src/model-sync-runtime.ts
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual2 } from "node:util";
import { credentialRef } from "@deepseek-ai/dsh-credentials";

// src/model-sync.ts
import { isDeepStrictEqual } from "node:util";
function syncModelRows(previous, discovered) {
  const configured = /* @__PURE__ */ new Map();
  if (previous !== void 0 && !Array.isArray(previous)) throw new Error("configured models must be an array");
  for (const row of previous ?? []) {
    if (row === null || typeof row !== "object" || typeof row.id !== "string") throw new Error("invalid configured model");
    configured.set(row.id, row);
  }
  return [...discovered].sort((a, b) => a.id.localeCompare(b.id)).map((model) => {
    const existing = configured.get(model.id);
    if (existing !== void 0) return existing;
    return {
      id: model.id,
      ...model.name === void 0 ? {} : { name: model.name },
      ...model.contextWindow === void 0 ? {} : { contextWindow: model.contextWindow },
      ...model.maxTokens === void 0 ? {} : { maxTokens: model.maxTokens },
      ...model.inputModalities === void 0 ? {} : { input: [...model.inputModalities] }
    };
  });
}
var ModelCatalogSync = class {
  /**
   * @param config - Current opt-in targets and pacing, or undefined when disabled.
   * @param ports - Settings owner, endpoint discovery, backup and diagnostics.
   */
  constructor(config, ports) {
    this.config = config;
    this.ports = ports;
  }
  inflight;
  controller;
  disposed = false;
  /** Refresh selected routes once, sharing concurrent callers.
   * @returns Completion of the current refresh, including isolated provider failures.
   */
  refresh() {
    if (this.disposed) return Promise.resolve();
    if (this.inflight !== void 0) return this.inflight;
    const operation = this.run().finally(() => {
      this.inflight = void 0;
    });
    this.inflight = operation;
    return operation;
  }
  /** Cancel discovery and permanently prohibit further writes. */
  dispose() {
    this.disposed = true;
    this.controller?.abort();
  }
  async run() {
    const config = this.config();
    if (config === void 0) return;
    const seen = /* @__PURE__ */ new Set();
    for (const target of config.targets) {
      const key = JSON.stringify([target.settingsNs, target.provider]);
      if (seen.has(key)) continue;
      seen.add(key);
      if (this.disposed) return;
      const controller = new AbortController();
      this.controller = controller;
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);
      let phase = "read";
      try {
        const before = this.ports.read(target);
        phase = "fetch";
        const models = await this.ports.discover(target, before.profile, controller.signal);
        if (this.disposed || controller.signal.aborted) continue;
        if (models.length === 0) {
          this.ports.report(target, "empty");
          continue;
        }
        phase = "merge";
        const rows = syncModelRows(before.profile.models, models);
        if (isDeepStrictEqual(rows, before.profile.models)) continue;
        const enabled = () => this.config()?.targets.some((item) => item.settingsNs === target.settingsNs && item.provider === target.provider) === true;
        const unchanged = (snapshot) => isDeepStrictEqual(snapshot.profile, before.profile);
        if (!enabled() || !unchanged(this.ports.read(target))) {
          this.ports.report(target, "changed");
          continue;
        }
        phase = "backup";
        await this.ports.backup(target, before.profile.models);
        if (this.disposed || controller.signal.aborted) continue;
        const fresh = this.ports.read(target);
        if (!enabled() || !unchanged(fresh)) {
          this.ports.report(target, "changed");
          continue;
        }
        phase = "write";
        await this.ports.write(target, rows, fresh.revision);
        phase = "verify";
        if (!isDeepStrictEqual(this.ports.read(target).profile.models, rows)) throw new Error("model catalog readback differs");
        this.ports.report(target, "updated", rows.length);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const reason = /conflict|revision/i.test(message) ? "conflict" : /validation|schema|not volatile|llm-pi-ai/i.test(message) ? "validation" : /disposed|inactive|fiber|effect/i.test(message) ? "inactive" : "other";
        if (!this.disposed) this.ports.report(target, "failed", void 0, { phase, reason });
      } finally {
        clearTimeout(timer);
        this.controller = void 0;
      }
    }
  }
};

// src/api-models.ts
async function fetchApiModels(request) {
  const base = request.baseURL.replace(/\/+$/, "");
  const anthropic = request.api === "anthropic-messages";
  if (!anthropic && !["openai-completions", "openai-responses", "openai-codex-responses"].includes(request.api)) {
    throw new Error("API model synchronization does not support this protocol");
  }
  const headers = new Headers(request.headers);
  if (anthropic) headers.set("anthropic-version", "2023-06-01");
  if (request.apiKey !== void 0) headers.set(anthropic ? "x-api-key" : "authorization", anthropic ? request.apiKey : `Bearer ${request.apiKey}`);
  const root = anthropic && base.endsWith("/v1") ? base.slice(0, -3) : base;
  const url = anthropic ? `${root}/v1/models?limit=1000` : `${base}/models`;
  const response = await fetch(url, { headers, signal: request.signal, redirect: "error" });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`API model listing returned HTTP ${response.status}`);
  }
  if (response.body === null) throw new Error("API model listing has no body");
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    for (; ; ) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 2 * 1024 * 1024) throw new Error("API model listing exceeds 2 MiB");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel();
  }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const parsed = JSON.parse(new TextDecoder().decode(body));
  if (parsed === null || typeof parsed !== "object") throw new Error("API model listing must be an object");
  const listing = parsed;
  if (listing.has_more === true || typeof listing.next_page === "string" || typeof listing.next === "string") throw new Error("API model listing is paginated");
  let rows;
  if (Array.isArray(listing.data)) rows = listing.data.map((row) => [void 0, row]);
  else if (listing.models !== null && typeof listing.models === "object" && !Array.isArray(listing.models)) rows = Object.entries(listing.models);
  else throw new Error("API model listing has no data array or models map");
  const models = /* @__PURE__ */ new Map();
  for (const [key, value] of rows) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      if (Array.isArray(listing.data)) throw new Error("API model listing contains an invalid row");
      continue;
    }
    const row = value;
    const id = key || row.id;
    if (typeof id !== "string" || id.length === 0) throw new Error("API model listing contains an invalid model id");
    const name = row.name ?? row.display_name;
    const context = row.contextWindow ?? row.context_window;
    const output = row.maxTokens ?? row.max_output_tokens ?? row.max_tokens;
    const input = row.input ?? row.input_modalities;
    models.set(id, {
      id,
      ...typeof name !== "string" ? {} : { name },
      ...typeof context !== "number" || !Number.isSafeInteger(context) || context <= 0 ? {} : { contextWindow: context },
      ...typeof output !== "number" || !Number.isSafeInteger(output) || output <= 0 ? {} : { maxTokens: output },
      ...!Array.isArray(input) || input.length === 0 || !input.every((item) => item === "text" || item === "image") ? {} : { inputModalities: input }
    });
  }
  return [...models.values()];
}

// src/model-sync-runtime.ts
function installModelSync(ctx, config) {
  const sync = new ModelCatalogSync(config, {
    read(target) {
      const section = ctx.settings.describe().find((entry) => entry.ns === target.settingsNs);
      const value = section?.value;
      const profile = value?.providers?.[target.provider];
      if (section === void 0 || profile === null || typeof profile !== "object" || Array.isArray(profile)) {
        throw new Error("model sync target is not a configured provider");
      }
      return { revision: section.revision, profile: structuredClone(profile) };
    },
    discover: async (_target, profile, signal) => {
      if (typeof profile.baseURL !== "string" || profile.baseURL.length === 0 || typeof profile.api !== "string") {
        throw new Error("automatic API discovery requires an explicit endpoint and protocol");
      }
      let apiKey;
      if (typeof profile.apiKeyEnv === "string") {
        apiKey = (await ctx.credentials.resolve(credentialRef(profile.apiKeyEnv)))?.value;
        if (apiKey === void 0 || apiKey.length === 0) throw new Error("API model synchronization credential is unavailable");
      }
      return fetchApiModels({
        baseURL: profile.baseURL,
        api: profile.api,
        signal,
        ...apiKey === void 0 ? {} : { apiKey },
        ...profile.headers === void 0 ? {} : { headers: profile.headers }
      });
    },
    async backup(target, previous) {
      const root = join(dirname(ctx.settings.documentPath), ".model-catalog-backups");
      await mkdir(root, { recursive: true });
      const key = createHash("sha256").update(JSON.stringify(target)).digest("hex").slice(0, 16);
      await writeFile(join(root, `${key}-${randomUUID()}.json`), JSON.stringify({ ...target, models: previous ?? null }, null, 2) + "\n", { flag: "wx" });
    },
    write: (target, models, revision) => ctx.settings.mutate(target.settingsNs, [
      { op: "set", path: ["providers", target.provider, "models"], value: models }
    ], revision),
    report(target, outcome, count, failure) {
      const root = join(dirname(ctx.settings.documentPath), ".model-catalog-backups");
      const key = createHash("sha256").update(JSON.stringify(target)).digest("hex").slice(0, 16);
      void mkdir(root, { recursive: true }).then(() => writeFile(
        join(root, `${key}-status.json`),
        JSON.stringify({ ...target, outcome, count, failure, checkedAt: (/* @__PURE__ */ new Date()).toISOString() }) + "\n"
      )).catch(() => {
        ctx.logger.warn("API model sync status could not be saved");
      });
      const message = `API model sync ${target.provider}: ${outcome}${count === void 0 ? "" : ` (${count} models)`}`;
      if (outcome === "updated") ctx.logger.info(message);
      else ctx.logger.warn(message);
    }
  });
  let stopped = false;
  let running = false;
  let lastPolicy = config();
  let timer;
  const tick = async () => {
    if (stopped || running) return;
    running = true;
    clearTimeout(timer);
    await sync.refresh();
    running = false;
    const interval = config()?.intervalMs;
    if (!stopped && interval !== void 0) timer = setTimeout(() => {
      void tick();
    }, interval);
  };
  ctx.on("loader/volatile-update", () => {
    const next = config();
    if (isDeepStrictEqual2(next, lastPolicy)) return;
    lastPolicy = next;
    void tick();
  });
  ctx.effect(() => {
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
      sync.dispose();
    };
  });
}

// src/provider-visibility.ts
import z3 from "@deepseek-ai/schemastery";

// src/provider-visibility-shared.ts
var PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "provider-visibility";
var DEFAULT_HIDDEN_PROVIDERS = [];

// src/model-sync-config.ts
import z2 from "@deepseek-ai/schemastery";
var ModelSyncSchema = z2.object({
  targets: z2.array(z2.object({ settingsNs: z2.string().min(1).required(), provider: z2.string().min(1).required() })).default([]),
  intervalMs: z2.number().min(1e3).default(3e5),
  timeoutMs: z2.number().min(100).default(1e4)
});

// src/provider-visibility.ts
var ProviderVisibilitySettingsSchema = z3.object({
  modelSync: ModelSyncSchema,
  hiddenProviders: z3.array(z3.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
  redirects: z3.transform(z3.array(z3.object({
    sourceProvider: z3.string().required(),
    sourceModel: z3.string(),
    targetProvider: z3.string().required(),
    targetModel: z3.string().required()
  })), validateRedirectRules, true).default([])
});
var Config = ProviderVisibilitySettingsSchema.volatile();
function normalizeHiddenProviders(providers) {
  return [...new Set(providers.filter((provider) => provider.length > 0))];
}

// src/index.ts
var ProviderVisibilityService = class extends Service {
  constructor(ctx, config) {
    super(ctx, "providerVisibility");
    this.config = config;
  }
  isHidden(provider) {
    return this.hiddenProviders().includes(provider);
  }
  hiddenProviders() {
    return Object.freeze(normalizeHiddenProviders(this.config.get().hiddenProviders));
  }
};
function apply(ctx, config) {
  const service = new ProviderVisibilityService(ctx, config);
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber));
    settingsCtx.inject(["llm", "credentials"], (runtimeCtx) => {
      installModelSync(runtimeCtx, () => config.get().modelSync);
    });
    settingsCtx.inject(["llm", "sessionProjections", "agentLoop"], async (runtimeCtx) => {
      await installRedirects(runtimeCtx, () => config.get().redirects);
    });
  });
}
export {
  Config,
  DEFAULT_HIDDEN_PROVIDERS,
  PROVIDER_VISIBILITY_SETTINGS_NAMESPACE,
  ProviderVisibilityService,
  ProviderVisibilitySettingsSchema,
  apply,
  normalizeHiddenProviders
};
