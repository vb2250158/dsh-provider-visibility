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

// src/provider-visibility.ts
import z2 from "@deepseek-ai/schemastery";

// src/provider-visibility-shared.ts
var PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "provider-visibility";
var DEFAULT_HIDDEN_PROVIDERS = [];

// src/provider-visibility.ts
var ProviderVisibilitySettingsSchema = z2.object({
  hiddenProviders: z2.array(z2.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
  redirects: z2.transform(z2.array(z2.object({
    sourceProvider: z2.string().required(),
    sourceModel: z2.string(),
    targetProvider: z2.string().required(),
    targetModel: z2.string().required()
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
