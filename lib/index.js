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
  if (event.type === "user/message" && event.data.source.kind === "plugin" && event.data.source.plugin === REDIRECT_PRODUCER) {
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
function installRedirects(ctx, getRules) {
  ctx.effect(() => ctx.sessionProjections.register(redirectHistoryProjection));
  ctx.effect(() => ctx.sessionProjections.register(runningRedirectProjection));
  const prepared = /* @__PURE__ */ new WeakMap();
  ctx.on("system-prompt/assemble", async (_assembly, context, next) => {
    const agent = context.agent;
    const pending = agent === void 0 ? null : ctx.sessionProjections.stateOf(agent.session, "modelSelection")?.pending;
    const rules = [...getRules()];
    validateRedirectRules(rules);
    const assembled = await next();
    if (agent === void 0) return assembled;
    const provider = pending?.provider ?? assembled.variables.provider;
    const model = pending?.model ?? assembled.variables.model;
    if (typeof provider !== "string" || typeof model !== "string") {
      prepared.delete(agent);
      return assembled;
    }
    const from = { provider, model };
    const to = redirectRoute(from, rules);
    prepared.set(agent, { version: 1, from, to });
    return { ...assembled, variables: { ...assembled.variables, provider: to.provider, model: to.model } };
  }, { prepend: true });
  ctx.on("agent/request", async ({ agent, signal }, next) => {
    const proposed = await next();
    signal.throwIfAborted();
    const record = prepared.get(agent);
    if (record === void 0) return proposed;
    const config = { ...proposed, ...record.to };
    if (sameRoute(record.from, record.to)) return config;
    await ctx.llm.resolveCallConfig(config, signal);
    signal.throwIfAborted();
    const pending = ctx.sessionProjections.stateOf(agent.session, "modelSelection")?.pending;
    if (pending == null) {
      agent.session.append("model/selection", {
        ...record.from,
        ...proposed.reasoningEffort === void 0 ? {} : { reasoningEffort: proposed.reasoningEffort }
      });
    }
    agent.session.append("user/message", createUserMessage({
      content: [{ type: "text", text: JSON.stringify(record) }],
      source: {
        kind: "plugin",
        plugin: REDIRECT_PRODUCER,
        form: "notice",
        summary: boundContextSummary(`\u6A21\u578B\u91CD\u5B9A\u5411\uFF1A${record.from.provider}/${record.from.model} \u2192 ${record.to.provider}/${record.to.model}`)
      }
    }), { surfaceOp: "append" });
    return config;
  }, { prepend: true });
}

// src/provider-visibility.ts
import z2 from "@deepseek-ai/schemastery";

// src/provider-visibility-shared.ts
var PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "llm-provider-visibility";
var DEFAULT_HIDDEN_PROVIDERS = [];

// src/provider-visibility.ts
var ProviderVisibilitySettingsSchema = z2.object({
  hiddenProviders: z2.array(z2.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
  redirects: z2.transform(z2.array(z2.object({
    sourceProvider: z2.string().required(),
    sourceModel: z2.string(),
    targetProvider: z2.string().required(),
    targetModel: z2.string().required()
  })), (values) => {
    const rules = values.map((value) => {
      if (typeof value.sourceProvider !== "string" || typeof value.targetProvider !== "string" || typeof value.targetModel !== "string") throw new Error("redirect.empty");
      return {
        sourceProvider: value.sourceProvider,
        ...value.sourceModel == null ? {} : { sourceModel: value.sourceModel },
        targetProvider: value.targetProvider,
        targetModel: value.targetModel
      };
    });
    validateRedirectRules(rules);
    return rules;
  }).default([])
});
var Config = z2.object({
  hiddenProviders: z2.array(z2.string()).default([...DEFAULT_HIDDEN_PROVIDERS])
});
function normalizeHiddenProviders(providers) {
  return [...new Set(providers.filter((provider) => provider.length > 0))];
}

// src/index.ts
var SETTINGS_NAMESPACE = PROVIDER_VISIBILITY_SETTINGS_NAMESPACE;
var ProviderVisibilityService = class extends Service {
  fallback;
  settings;
  constructor(ctx, config = {}) {
    super(ctx, "providerVisibility");
    this.fallback = normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS);
  }
  /** Attach the settings owner once the settings provider is available. */
  attachSettings(scope) {
    this.settings = scope;
  }
  isHidden(provider) {
    return this.hiddenProviders().includes(provider);
  }
  hiddenProviders() {
    const value = this.settings?.get();
    return Object.freeze(normalizeHiddenProviders(value?.hiddenProviders ?? this.fallback));
  }
};
function apply(ctx, config = {}) {
  const service = new ProviderVisibilityService(ctx, config);
  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, {
      base: { hiddenProviders: normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS), redirects: [] }
    });
    service.attachSettings(scope);
    settingsCtx.inject(["llm", "sessionProjections"], (runtimeCtx) => {
      installRedirects(runtimeCtx, () => scope.get().redirects);
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
