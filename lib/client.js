window.__ModuleLoader__.load({
  id: "dsh-provider-visibility",
  factory: (require) => {
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="dsh-provider-visibility/ProviderVisibilitySection.module.css"]') === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = "dsh-provider-visibility"
      tag.dataset.pluginCss = "dsh-provider-visibility/ProviderVisibilitySection.module.css"
      tag.textContent = "/* src/client/ProviderVisibilitySection.module.css */\n.ProviderVisibilitySection_section {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 720px;\n  width: 100%;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n}\n.ProviderVisibilitySection_panel {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n  padding: 20px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  background: var(--dsw-alias-bg-module-platform);\n}\n.ProviderVisibilitySection_redirectForm {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 16px;\n}\n.ProviderVisibilitySection_redirectForm > div {\n  min-width: 0;\n}\n.ProviderVisibilitySection_redirectForm p {\n  margin: 0 0 8px;\n  font-size: 14px;\n  line-height: 22px;\n}\n.ProviderVisibilitySection_formFooter {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n}\n.ProviderVisibilitySection_formFooter > button {\n  min-height: 44px;\n}\n.ProviderVisibilitySection_scopeOption {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  font-size: 13px;\n  line-height: 20px;\n  min-height: 44px;\n}\n.ProviderVisibilitySection_scopeOption > button {\n  flex: none;\n}\n.ProviderVisibilitySection_feedback {\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n@media (max-width: 540px) {\n  .ProviderVisibilitySection_panel {\n    padding: 16px;\n  }\n  .ProviderVisibilitySection_redirectForm {\n    grid-template-columns: minmax(0, 1fr);\n  }\n  .ProviderVisibilitySection_formFooter > button {\n    width: 100%;\n  }\n}\n.ProviderVisibilitySection_title {\n  margin: 0;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 500;\n}\n.ProviderVisibilitySection_intro,\n.ProviderVisibilitySection_hint,\n.ProviderVisibilitySection_notice,\n.ProviderVisibilitySection_error,\n.ProviderVisibilitySection_meta {\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n.ProviderVisibilitySection_intro {\n  font-size: 14px;\n  line-height: 22px;\n}\n.ProviderVisibilitySection_notice {\n  color: var(--dsw-alias-state-warn-label);\n}\n.ProviderVisibilitySection_error {\n  color: var(--dsw-alias-state-error-primary);\n}\n.ProviderVisibilitySection_toggle:focus-visible {\n  outline: none;\n  box-shadow: 0 0 0 2px var(--dsw-alias-border-l3);\n}\n.ProviderVisibilitySection_rows {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin: 12px 0 0;\n  padding: 0;\n  list-style: none;\n}\n.ProviderVisibilitySection_row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-height: 56px;\n  padding: 10px 14px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n}\n.ProviderVisibilitySection_identity {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  gap: 2px;\n  overflow-wrap: anywhere;\n}\n.ProviderVisibilitySection_name {\n  overflow: hidden;\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 500;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.ProviderVisibilitySection_meta {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.ProviderVisibilitySection_state {\n  flex: none;\n  padding: 2px 7px;\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 16px;\n}\n.ProviderVisibilitySection_action {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  margin-left: auto;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  white-space: nowrap;\n  min-height: 44px;\n  flex: none;\n}\n.ProviderVisibilitySection_toggle {\n  width: 18px;\n  height: 18px;\n  margin: 0;\n  accent-color: var(--dsw-alias-brand-primary);\n  cursor: pointer;\n}\n.ProviderVisibilitySection_toggle:disabled {\n  cursor: default;\n  opacity: 0.45;\n}\n"
      document.head.appendChild(tag)
    }
    var module = { exports: {} }
    var exports = module.exports
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

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

// src/provider-visibility-shared.ts
var PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "provider-visibility";
var DEFAULT_HIDDEN_PROVIDERS = [];
function decodeProviderVisibility(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  const section = value;
  if (!Array.isArray(section.hiddenProviders) || !section.hiddenProviders.every((id) => typeof id === "string")) return void 0;
  const entries = section.redirects ?? [];
  if (!Array.isArray(entries)) return void 0;
  const redirects = [];
  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return void 0;
    const rule = entry;
    if (typeof rule.sourceProvider !== "string" || typeof rule.targetProvider !== "string" || typeof rule.targetModel !== "string" || rule.sourceModel !== void 0 && typeof rule.sourceModel !== "string") return void 0;
    redirects.push({
      sourceProvider: rule.sourceProvider,
      targetProvider: rule.targetProvider,
      targetModel: rule.targetModel,
      ...rule.sourceModel === void 0 ? {} : { sourceModel: rule.sourceModel }
    });
  }
  try {
    validateRedirectRules(redirects);
  } catch {
    return void 0;
  }
  return { hiddenProviders: section.hiddenProviders, redirects };
}

// src/client/settings-form.ts
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");
function createVisibilityForm(source, mirror) {
  const store = (0, import_dsh_client_store.createSnapshotStore)(source.getSnapshot());
  const derive = () => {
    const mirrored = mirror.getSnapshot();
    const view = mirrored.view?.namespaces.find((entry) => entry.ns === PROVIDER_VISIBILITY_SETTINGS_NAMESPACE);
    const value = view === void 0 ? void 0 : decodeProviderVisibility(view.value);
    store.update((snapshot) => {
      snapshot.writable = mirrored.view?.writable === true;
      snapshot.status = mirrored.view === void 0 && mirrored.error != null || mirrored.view !== void 0 && value === void 0 ? "unavailable" : value === void 0 ? "loading" : "ready";
      snapshot.value = value;
      snapshot.revision = view?.revision;
      snapshot.base = view?.base;
      snapshot.user = view?.user;
    });
  };
  const dispose = mirror.subscribe(derive);
  derive();
  const form = {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    set: source.set.bind(source),
    unset: source.unset.bind(source),
    mutate: source.mutate.bind(source)
  };
  return { form, dispose };
}

// src/client/ProviderVisibilitySection.tsx
var React2 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/ProviderVisibilitySection.module.css
var ProviderVisibilitySection_default = {
  section: "ProviderVisibilitySection_section",
  panel: "ProviderVisibilitySection_panel",
  redirectForm: "ProviderVisibilitySection_redirectForm",
  formFooter: "ProviderVisibilitySection_formFooter",
  scopeOption: "ProviderVisibilitySection_scopeOption",
  feedback: "ProviderVisibilitySection_feedback",
  title: "ProviderVisibilitySection_title",
  intro: "ProviderVisibilitySection_intro",
  hint: "ProviderVisibilitySection_hint",
  notice: "ProviderVisibilitySection_notice",
  error: "ProviderVisibilitySection_error",
  meta: "ProviderVisibilitySection_meta",
  toggle: "ProviderVisibilitySection_toggle",
  rows: "ProviderVisibilitySection_rows",
  row: "ProviderVisibilitySection_row",
  identity: "ProviderVisibilitySection_identity",
  name: "ProviderVisibilitySection_name",
  state: "ProviderVisibilitySection_state",
  action: "ProviderVisibilitySection_action"
};

// src/client/RedirectRules.tsx
var React = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function routeName(groups, provider, model) {
  const group = groups.find((group2) => group2.id === provider);
  return model === void 0 ? group?.name ?? provider : `${group?.models.find((entry) => entry.id === model)?.name ?? model} \xB7 ${group?.name ?? provider}`;
}
function RedirectRules({ groups, rules, writable, save, t, renderSlot }) {
  const [from, setFrom] = React.useState(null);
  const [to, setTo] = React.useState(null);
  const [allModels, setAllModels] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [feedback, setFeedback] = React.useState(null);
  const hintId = React.useId();
  const persist = async (next, clear) => {
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      validateRedirectRules(next);
      await save(next);
      if (clear) {
        setFrom(null);
        setTo(null);
        setAllModels(false);
      }
      setFeedback(t(clear ? "redirect.saved" : "redirect.removed"));
    } catch (error2) {
      const message = error2 instanceof Error ? error2.message : String(error2);
      setError(message === "redirect.duplicate" || message === "redirect.self" || message === "redirect.empty" ? t(message) : message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: ProviderVisibilitySection_default.panel, "aria-label": t("redirect.title"), "aria-busy": busy }, /* @__PURE__ */ React.createElement("h3", { className: ProviderVisibilitySection_default.title }, t("redirect.title")), /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default.hint }, t("redirect.hint")), /* @__PURE__ */ React.createElement("ul", { className: ProviderVisibilitySection_default.rows }, rules.map((rule, index) => /* @__PURE__ */ React.createElement("li", { className: ProviderVisibilitySection_default.row, key: JSON.stringify([rule.sourceProvider, rule.sourceModel]) }, /* @__PURE__ */ React.createElement("span", { className: ProviderVisibilitySection_default.identity }, /* @__PURE__ */ React.createElement("span", null, routeName(groups, rule.sourceProvider, rule.sourceModel), rule.sourceModel === void 0 ? ` \xB7 ${t("redirect.all")}` : ""), /* @__PURE__ */ React.createElement("span", null, "\u2192 ", routeName(groups, rule.targetProvider, rule.targetModel))), /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", disabled: !writable || busy, onClick: () => {
    void persist(rules.filter((_, position) => position !== index), false);
  } }, t("redirect.remove"))))), rules.length === 0 && /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default.hint }, t("redirect.none")), /* @__PURE__ */ React.createElement("div", { className: ProviderVisibilitySection_default.redirectForm }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, t("redirect.from")), renderSlot("settings.model-redirect.picker", { groups, current: from, locked: !writable || busy, select: setFrom })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, t("redirect.to")), renderSlot("settings.model-redirect.picker", { groups, current: to, locked: !writable || busy, select: setTo }))), /* @__PURE__ */ React.createElement("div", { className: ProviderVisibilitySection_default.formFooter }, /* @__PURE__ */ React.createElement("label", { className: ProviderVisibilitySection_default.scopeOption }, /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.Switch, { checked: allModels, disabled: !writable || busy, onChange: setAllModels, label: t("redirect.all") }), /* @__PURE__ */ React.createElement("span", null, t("redirect.all"))), /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.Button, { variant: "primary", size: "md", "aria-describedby": hintId, disabled: !writable || busy || from === null || to === null, onClick: () => {
    if (from === null || to === null) return;
    void persist([...rules, { sourceProvider: from.provider, ...allModels ? {} : { sourceModel: from.model }, targetProvider: to.provider, targetModel: to.model }], true);
  } }, t(busy ? "saving" : "redirect.add"))), /* @__PURE__ */ React.createElement("p", { id: hintId, className: ProviderVisibilitySection_default.hint }, t(from === null || to === null ? "redirect.chooseHint" : allModels ? "redirect.scopeHint" : "redirect.exactHint")), feedback !== null && /* @__PURE__ */ React.createElement("p", { role: "status", className: ProviderVisibilitySection_default.feedback }, feedback), error !== null && /* @__PURE__ */ React.createElement("p", { role: "alert", className: ProviderVisibilitySection_default.error }, error));
}

// src/client/ProviderVisibilitySection.tsx
function format(template, provider) {
  return template.replace("{provider}", () => provider);
}
function ProviderVisibilitySection(props) {
  const { controller, useSnapshot, settings, setProviderVisible, saveRedirects, renderSlot, t } = props;
  if (controller === void 0 || useSnapshot === void 0 || settings === void 0 || setProviderVisible === void 0 || saveRedirects === void 0 || t === void 0) return null;
  return /* @__PURE__ */ React2.createElement(Loaded, { injected: { controller, useSnapshot, settings, setProviderVisible, saveRedirects, renderSlot, t } });
}
function Loaded({ injected }) {
  const { controller, setProviderVisible, t } = injected;
  const state = injected.useSnapshot((snapshot) => snapshot);
  const settings = React2.useSyncExternalStore(
    (listener) => injected.settings.subscribe(listener),
    () => injected.settings.getSnapshot()
  );
  const [pending, setPending] = React2.useState(void 0);
  const [feedback, setFeedback] = React2.useState(null);
  const [saveError, setSaveError] = React2.useState(null);
  React2.useEffect(() => {
    if (state.status === "idle") void controller.load();
  }, [controller, state.status]);
  if (state.status === "error") {
    return /* @__PURE__ */ React2.createElement("div", { className: ProviderVisibilitySection_default["section"] }, /* @__PURE__ */ React2.createElement("p", { className: ProviderVisibilitySection_default["error"] }, `${t("loadFailed")}: ${state.error ?? ""}`), /* @__PURE__ */ React2.createElement(import_dsh_client_ui_primitives2.Button, { variant: "outline", size: "sm", onClick: () => {
      void controller.load();
    } }, t("retry")));
  }
  const hidden = new Set(settings.value?.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS);
  const writable = settings.status === "ready" && settings.writable;
  const settingsNotice = settings.status === "loading" ? t("loading") : settings.status === "unavailable" ? t("unavailable") : settings.status === "ready" && !settings.writable ? t("readOnly") : void 0;
  return /* @__PURE__ */ React2.createElement("div", { className: ProviderVisibilitySection_default["section"], "data-provider-visibility-settings": true }, /* @__PURE__ */ React2.createElement("h2", { className: ProviderVisibilitySection_default["title"] }, t("title")), settingsNotice === void 0 ? null : /* @__PURE__ */ React2.createElement("p", { role: "status", className: ProviderVisibilitySection_default["notice"] }, settingsNotice), /* @__PURE__ */ React2.createElement(
    RedirectRules,
    {
      groups: state.groups,
      rules: settings.value?.redirects ?? [],
      writable,
      save: injected.saveRedirects,
      renderSlot: injected.renderSlot,
      t
    }
  ), /* @__PURE__ */ React2.createElement("section", { className: ProviderVisibilitySection_default["panel"], "aria-label": t("providerTitle") }, /* @__PURE__ */ React2.createElement("h3", { className: ProviderVisibilitySection_default["title"] }, t("providerTitle")), /* @__PURE__ */ React2.createElement("p", { className: ProviderVisibilitySection_default["intro"] }, t("intro")), /* @__PURE__ */ React2.createElement("p", { className: ProviderVisibilitySection_default["hint"] }, t("hiddenHint")), state.status === "loading" || state.status === "idle" ? /* @__PURE__ */ React2.createElement("p", { role: "status", className: ProviderVisibilitySection_default["hint"] }, t("loadingProviders")) : null, /* @__PURE__ */ React2.createElement("ul", { className: ProviderVisibilitySection_default["rows"] }, (settings.value === void 0 ? [] : state.providers).map((provider) => {
    const visible = !hidden.has(provider.provider);
    return /* @__PURE__ */ React2.createElement("li", { key: provider.provider, className: ProviderVisibilitySection_default["row"] }, /* @__PURE__ */ React2.createElement("span", { className: ProviderVisibilitySection_default["identity"] }, /* @__PURE__ */ React2.createElement("span", { className: ProviderVisibilitySection_default["name"] }, provider.displayName), /* @__PURE__ */ React2.createElement("span", { className: ProviderVisibilitySection_default["meta"] }, format(t("providerId"), provider.provider))), /* @__PURE__ */ React2.createElement("label", { className: ProviderVisibilitySection_default["action"] }, /* @__PURE__ */ React2.createElement("span", null, pending === provider.provider ? t("saving") : visible ? t("show") : t("hide")), /* @__PURE__ */ React2.createElement(
      import_dsh_client_ui_primitives2.Switch,
      {
        checked: visible,
        disabled: !writable || pending !== void 0,
        label: format(visible ? t("hideProvider") : t("showProvider"), provider.displayName),
        title: settingsNotice,
        onChange: () => {
          setPending(provider.provider);
          setFeedback(null);
          setSaveError(null);
          void setProviderVisible(provider.provider, !visible).then(() => {
            setFeedback(t("saved"));
          }).catch((error) => {
            setSaveError(error instanceof Error ? error.message : t("saveFailed"));
          }).finally(() => {
            setPending(void 0);
          });
        }
      }
    )));
  })), feedback === null ? null : /* @__PURE__ */ React2.createElement("p", { role: "status", className: ProviderVisibilitySection_default["feedback"] }, feedback), saveError === null ? null : /* @__PURE__ */ React2.createElement("p", { role: "alert", className: ProviderVisibilitySection_default["error"] }, saveError), state.status === "ready" && state.providers.length === 0 ? /* @__PURE__ */ React2.createElement("p", { className: ProviderVisibilitySection_default["hint"] }, t("empty")) : null));
}

// src/client/locales.ts
var en = {
  loading: "Loading settings\u2026",
  loadingProviders: "Loading providers\u2026",
  saving: "Saving\u2026",
  saved: "Saved. Changes apply immediately.",
  saveFailed: "The change was not saved. Check the connection and try again.",
  providerTitle: "Provider visibility",
  "redirect.scopeHint": "Applies to every model from the selected source provider.",
  "redirect.exactHint": "Applies only to the selected source model.",
  "redirect.chooseHint": "Choose a source and destination to add a rule.",
  "redirect.saved": "Rule added. Applies to subsequent requests.",
  "redirect.removed": "Rule removed. Subsequent requests use the original route.",
  "redirect.title": "Model redirects",
  "redirect.hint": "Exact model rules take priority. Each request redirects once and keeps the selected model. Removing a rule restores the original route. Replies retain the actual route.",
  "redirect.all": "All models from this provider",
  "redirect.from": "Original provider and model",
  "redirect.to": "Destination provider and model",
  "redirect.add": "Add rule",
  "redirect.remove": "Remove",
  "redirect.none": "No redirect rules.",
  "redirect.duplicate": "A rule already exists for this source. Remove it before adding another.",
  "redirect.self": "The destination must differ from the source.",
  "redirect.empty": "Choose both the source and destination.",
  "redirect.badge": "Redirected",
  nav: "Model list",
  title: "Model routing and visibility",
  intro: "Choose which providers appear in the model selector.",
  hiddenHint: "Hidden providers remain available to existing routes and direct model requests.",
  show: "Show",
  hide: "Hide",
  showProvider: "Show {provider}",
  hideProvider: "Hide {provider}",
  active: "Available",
  inactive: "Not configured",
  providerId: "Provider ID: {provider}",
  readOnly: "Provider display settings are read-only in this deployment.",
  unavailable: "Settings could not be loaded. Reopen this page after checking the connection.",
  loadFailed: "Loading the provider list failed",
  retry: "Retry",
  empty: "No providers are registered."
};
var zh = {
  loading: "\u6B63\u5728\u52A0\u8F7D\u8BBE\u7F6E\u2026",
  loadingProviders: "\u6B63\u5728\u52A0\u8F7D\u63D0\u4F9B\u5546\u2026",
  saving: "\u6B63\u5728\u4FDD\u5B58\u2026",
  saved: "\u5DF2\u4FDD\u5B58\uFF0C\u5373\u65F6\u751F\u6548\u3002",
  saveFailed: "\u66F4\u6539\u672A\u4FDD\u5B58\uFF0C\u8BF7\u68C0\u67E5\u8FDE\u63A5\u540E\u91CD\u8BD5\u3002",
  providerTitle: "\u63D0\u4F9B\u5546\u663E\u793A",
  "redirect.scopeHint": "\u6B64\u89C4\u5219\u9002\u7528\u4E8E\u6765\u6E90\u63D0\u4F9B\u5546\u7684\u6240\u6709\u6A21\u578B\u3002",
  "redirect.exactHint": "\u6B64\u89C4\u5219\u4EC5\u9002\u7528\u4E8E\u9009\u5B9A\u7684\u6765\u6E90\u6A21\u578B\u3002",
  "redirect.chooseHint": "\u9009\u62E9\u6765\u6E90\u548C\u76EE\u6807\u6A21\u578B\u540E\u5373\u53EF\u6DFB\u52A0\u89C4\u5219\u3002",
  "redirect.saved": "\u89C4\u5219\u5DF2\u6DFB\u52A0\uFF0C\u4ECE\u540E\u7EED\u8BF7\u6C42\u751F\u6548\u3002",
  "redirect.removed": "\u89C4\u5219\u5DF2\u79FB\u9664\uFF0C\u540E\u7EED\u8BF7\u6C42\u6062\u590D\u539F\u8DEF\u7531\u3002",
  "redirect.title": "\u6A21\u578B\u91CD\u5B9A\u5411",
  "redirect.hint": "\u6307\u5B9A\u6A21\u578B\u4F18\u5148\u4E8E\u63D0\u4F9B\u5546\u89C4\u5219\uFF0C\u6BCF\u6B21\u8BF7\u6C42\u53EA\u91CD\u5B9A\u5411\u4E00\u6B21\u3002\u4FDD\u7559\u539F\u9009\u62E9\uFF0C\u79FB\u9664\u89C4\u5219\u540E\u6062\u590D\u539F\u8DEF\u7531\uFF1B\u56DE\u590D\u6309\u5F53\u8F6E\u5B9E\u9645\u4F7F\u7528\u7684\u6A21\u578B\u5B58\u6863\u3002",
  "redirect.all": "\u5339\u914D\u6B64\u63D0\u4F9B\u5546\u7684\u5168\u90E8\u6A21\u578B",
  "redirect.from": "\u539F\u63D0\u4F9B\u5546\u4E0E\u6A21\u578B",
  "redirect.to": "\u76EE\u6807\u63D0\u4F9B\u5546\u4E0E\u6A21\u578B",
  "redirect.add": "\u6DFB\u52A0\u89C4\u5219",
  "redirect.remove": "\u79FB\u9664",
  "redirect.none": "\u5C1A\u672A\u8BBE\u7F6E\u91CD\u5B9A\u5411\u89C4\u5219\u3002",
  "redirect.duplicate": "\u8BE5\u6765\u6E90\u5DF2\u6709\u89C4\u5219\uFF0C\u8BF7\u5148\u79FB\u9664\u518D\u6DFB\u52A0\u3002",
  "redirect.self": "\u76EE\u6807\u4E0D\u80FD\u4E0E\u6765\u6E90\u76F8\u540C\u3002",
  "redirect.empty": "\u8BF7\u9009\u62E9\u6765\u6E90\u548C\u76EE\u6807\u6A21\u578B\u3002",
  "redirect.badge": "\u5DF2\u91CD\u5B9A\u5411",
  nav: "\u6A21\u578B\u5217\u8868",
  title: "\u6A21\u578B\u8DEF\u7531\u4E0E\u663E\u793A",
  intro: "\u9009\u62E9\u54EA\u4E9B\u63D0\u4F9B\u65B9\u663E\u793A\u5728\u6A21\u578B\u9009\u62E9\u5668\u4E2D\u3002",
  hiddenHint: "\u9690\u85CF\u63D0\u4F9B\u65B9\u4ECD\u53EF\u4F9B\u5DF2\u6709\u8DEF\u7531\u548C\u76F4\u63A5\u6307\u5B9A\u6A21\u578B\u4F7F\u7528\u3002",
  show: "\u663E\u793A",
  hide: "\u9690\u85CF",
  showProvider: "\u663E\u793A {provider}",
  hideProvider: "\u9690\u85CF {provider}",
  active: "\u53EF\u7528",
  inactive: "\u672A\u914D\u7F6E",
  providerId: "\u63D0\u4F9B\u65B9 ID\uFF1A{provider}",
  readOnly: "\u5F53\u524D\u90E8\u7F72\u7684\u63D0\u4F9B\u65B9\u663E\u793A\u8BBE\u7F6E\u4E3A\u53EA\u8BFB\u3002",
  unavailable: "\u8BBE\u7F6E\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8FDE\u63A5\u540E\u91CD\u65B0\u6253\u5F00\u6B64\u9875\u3002",
  loadFailed: "\u52A0\u8F7D\u63D0\u4F9B\u65B9\u5217\u8868\u5931\u8D25",
  retry: "\u91CD\u8BD5",
  empty: "\u5F53\u524D\u6CA1\u6709\u5DF2\u6CE8\u518C\u7684\u63D0\u4F9B\u65B9\u3002"
};

// src/client/store.ts
var import_dsh_client_store2 = require("@deepseek-ai/dsh-client-store");
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
var ProviderVisibilityStore = class {
  constructor(loadCatalog) {
    this.loadCatalog = loadCatalog;
  }
  /** Snapshot store consumed by the settings section. */
  store = (0, import_dsh_client_store2.createSnapshotStore)({
    status: "idle",
    error: null,
    providers: [],
    groups: []
  });
  generation = 0;
  /** Load the same provider groups rendered by the current session's model selector. */
  async load() {
    const generation = ++this.generation;
    this.store.update((state) => {
      state.status = "loading";
      state.error = null;
    });
    try {
      const models = await this.loadCatalog();
      if (generation !== this.generation) return;
      this.store.update((state) => {
        state.status = "ready";
        state.error = null;
        state.groups = models.groups;
        state.providers = models.groups.map((group) => ({
          provider: group.id,
          displayName: group.name
        }));
      });
    } catch (error) {
      if (generation !== this.generation) return;
      this.store.update((state) => {
        state.status = "error";
        state.error = messageOf(error);
      });
    }
  }
};

// src/client/directory-policy.ts
var import_cordis = require("@deepseek-ai/cordis");
function installDirectoryVisibilityPolicy(resolver, hiddenProviders) {
  const target = resolver[import_cordis.symbols.original] ?? resolver;
  const descriptor = Object.getOwnPropertyDescriptor(target, "directoryFor");
  const original = target.directoryFor;
  const patched = /* @__PURE__ */ new WeakMap();
  const directories = /* @__PURE__ */ new Set();
  const collected = new FinalizationRegistry((ref) => directories.delete(ref));
  let active = true;
  function directoryFor(sessionId) {
    const directory = original.call(this, sessionId);
    if (!active || patched.has(directory)) return directory;
    const originalLoad = directory.load;
    const entry = {
      descriptor: Object.getOwnPropertyDescriptor(directory, "load"),
      async load() {
        const loaded = await originalLoad.call(this);
        if (!active) return loaded;
        entry.latest = { ...loaded, groups: [...loaded.groups], failures: [...loaded.failures] };
        const hidden = hiddenProviders();
        const filtered = {
          ...loaded,
          groups: loaded.groups.filter((group) => !hidden.has(group.id)),
          failures: loaded.failures.filter((failure) => !hidden.has(failure.id))
        };
        directory.store.update((state) => {
          state.groups = [...filtered.groups];
          state.failures = [...filtered.failures];
        });
        return filtered;
      }
    };
    patched.set(directory, entry);
    const ref = new WeakRef(directory);
    directories.add(ref);
    collected.register(directory, ref, ref);
    directory.load = entry.load;
    return directory;
  }
  target.directoryFor = directoryFor;
  return () => {
    active = false;
    if (target.directoryFor === directoryFor) {
      if (descriptor === void 0) Reflect.deleteProperty(target, "directoryFor");
      else Object.defineProperty(target, "directoryFor", descriptor);
    }
    for (const ref of directories) {
      collected.unregister(ref);
      const directory = ref.deref();
      if (directory === void 0) continue;
      const entry = patched.get(directory);
      if (entry === void 0 || directory.load !== entry.load) continue;
      if (entry.descriptor === void 0) Reflect.deleteProperty(directory, "load");
      else Object.defineProperty(directory, "load", entry.descriptor);
      const latest = entry.latest;
      if (latest !== void 0) directory.store.update((state) => {
        state.groups = [...latest.groups];
        state.failures = [...latest.failures];
      });
    }
    directories.clear();
  };
}

// src/client/index.ts
var NS = "settings.providerVisibility";
var inject = ["slots", "locale", "modelDirectories", "remote", "remote.session", "sessions", "configForms"];
function hiddenProvidersOf(value) {
  return new Set(value?.hiddenProviders ?? []);
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-provider-visibility: copy dictionaries");
  const projection = createVisibilityForm(
    ctx.configForms.get(PROVIDER_VISIBILITY_SETTINGS_NAMESPACE),
    ctx.configForms.describe()
  );
  ctx.effect(() => projection.dispose, "ui-provider-visibility: decoded configuration values");
  const scope = projection.form;
  const hiddenProviders = () => hiddenProvidersOf(scope.getSnapshot().value);
  ctx.effect(() => installDirectoryVisibilityPolicy(ctx.modelDirectories, hiddenProviders), "ui-provider-visibility: provider directory policy");
  const controller = new ProviderVisibilityStore(async () => {
    const response = await ctx.remote.session.modelCatalog();
    if (!response.ok) throw new Error(response.error.message);
    return response.value;
  });
  const setProviderVisible = async (provider, visible) => {
    const current = scope.getSnapshot().value;
    if (current === void 0) throw new Error(t("unavailable"));
    const hidden = hiddenProvidersOf(current);
    if (visible) hidden.delete(provider);
    else hidden.add(provider);
    if (!await scope.set("hiddenProviders", [...hidden].sort())) throw new Error(t("saveFailed"));
  };
  const t = ctx.locale.bind(NS);
  const injected = () => ({
    controller,
    hooks: { snapshot: controller.store },
    settings: scope,
    setProviderVisible,
    saveRedirects: async (rules) => {
      if (!await scope.set("redirects", rules)) throw new Error(t("saveFailed"));
    },
    t
  });
  ctx.effect(() => {
    const refresh = () => {
      if (controller.store.getSnapshot().status !== "idle") void controller.load();
    };
    const disposers = [
      ctx.sessions.list.subscribe(refresh),
      scope.subscribe(refresh),
      ctx.remote.$on("llm/adapters-updated", refresh),
      ctx.remote.$on("settings/document-updated", refresh),
      ctx.on("connection/reset", refresh)
    ];
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, "ui-provider-visibility: provider directory invalidations");
  ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
    name: "plugins.bundle.config",
    key: "dsh-provider-visibility",
    inject: injected,
    children: { "settings.model-redirect.picker": { kind: "single", scope: "root" } }
  }, ProviderVisibilitySection));
}

    return module.exports
  },
})
