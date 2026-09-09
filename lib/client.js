window.__ModuleLoader__.load({
  id: "dsh-provider-visibility",
  factory: (require) => {
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="dsh-provider-visibility/ProviderVisibilitySection.module.css"]') === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = "dsh-provider-visibility"
      tag.dataset.pluginCss = "dsh-provider-visibility/ProviderVisibilitySection.module.css"
      tag.textContent = "/* src/client/ProviderVisibilitySection.module.css */\n.ProviderVisibilitySection_section {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 720px;\n  color: var(--dsw-alias-label-primary);\n}\n.ProviderVisibilitySection_title {\n  margin: 0;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 500;\n}\n.ProviderVisibilitySection_intro,\n.ProviderVisibilitySection_hint,\n.ProviderVisibilitySection_notice,\n.ProviderVisibilitySection_error,\n.ProviderVisibilitySection_meta {\n  margin: 0;\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.ProviderVisibilitySection_intro {\n  font-size: 14px;\n  line-height: 22px;\n}\n.ProviderVisibilitySection_notice {\n  color: var(--dsw-alias-state-warn-label);\n}\n.ProviderVisibilitySection_error {\n  color: var(--dsw-alias-state-error-primary);\n}\n.ProviderVisibilitySection_toggle:focus-visible {\n  outline: none;\n  box-shadow: 0 0 0 2px var(--dsw-alias-border-l3);\n}\n.ProviderVisibilitySection_rows {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin: 12px 0 0;\n  padding: 0;\n  list-style: none;\n}\n.ProviderVisibilitySection_row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-height: 56px;\n  padding: 10px 14px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n}\n.ProviderVisibilitySection_identity {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  gap: 2px;\n}\n.ProviderVisibilitySection_name {\n  overflow: hidden;\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 500;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.ProviderVisibilitySection_meta {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.ProviderVisibilitySection_state {\n  flex: none;\n  padding: 2px 7px;\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 16px;\n}\n.ProviderVisibilitySection_action {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  margin-left: auto;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  white-space: nowrap;\n}\n.ProviderVisibilitySection_toggle {\n  width: 18px;\n  height: 18px;\n  margin: 0;\n  accent-color: var(--dsw-alias-brand-primary);\n  cursor: pointer;\n}\n.ProviderVisibilitySection_toggle:disabled {\n  cursor: default;\n  opacity: 0.45;\n}\n"
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

// src/provider-visibility-shared.ts
var PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "llm-provider-visibility";
var DEFAULT_HIDDEN_PROVIDERS = [];

// src/client/ProviderVisibilitySection.tsx
var React = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/ProviderVisibilitySection.module.css
var ProviderVisibilitySection_default = {
  section: "ProviderVisibilitySection_section",
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

// src/client/ProviderVisibilitySection.tsx
function format(template, provider) {
  return template.replace("{provider}", () => provider);
}
function ProviderVisibilitySection(props) {
  const { controller, useSnapshot, settings, setProviderVisible, t } = props;
  if (controller === void 0 || useSnapshot === void 0 || settings === void 0 || setProviderVisible === void 0 || t === void 0) return null;
  return /* @__PURE__ */ React.createElement(Loaded, { injected: { controller, useSnapshot, settings, setProviderVisible, t } });
}
function Loaded({ injected }) {
  const { controller, setProviderVisible, t } = injected;
  const state = injected.useSnapshot((snapshot) => snapshot);
  const settings = injected.settings.getSnapshot();
  const [pending, setPending] = React.useState(void 0);
  React.useEffect(() => {
    if (state.status === "idle") void controller.load();
  }, [controller, state.status]);
  if (state.status === "error") {
    return /* @__PURE__ */ React.createElement("div", { className: ProviderVisibilitySection_default["section"] }, /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default["error"] }, `${t("loadFailed")}: ${state.error ?? ""}`), /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", onClick: () => {
      void controller.load();
    } }, t("retry")));
  }
  const hidden = new Set(settings.value?.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS);
  const writable = settings.status === "ready" && settings.writable;
  const settingsNotice = settings.status === "unavailable" ? t("unavailable") : settings.status === "ready" && !settings.writable ? t("readOnly") : void 0;
  return /* @__PURE__ */ React.createElement("div", { className: ProviderVisibilitySection_default["section"] }, /* @__PURE__ */ React.createElement("h2", { className: ProviderVisibilitySection_default["title"] }, t("title")), /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default["intro"] }, t("intro")), /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default["hint"] }, t("hiddenHint")), settingsNotice === void 0 ? null : /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default["notice"] }, settingsNotice), /* @__PURE__ */ React.createElement("ul", { className: ProviderVisibilitySection_default["rows"] }, state.providers.map((provider) => {
    const visible = !hidden.has(provider.provider);
    return /* @__PURE__ */ React.createElement("li", { key: provider.provider, className: ProviderVisibilitySection_default["row"] }, /* @__PURE__ */ React.createElement("span", { className: ProviderVisibilitySection_default["identity"] }, /* @__PURE__ */ React.createElement("span", { className: ProviderVisibilitySection_default["name"] }, provider.displayName), /* @__PURE__ */ React.createElement("span", { className: ProviderVisibilitySection_default["meta"] }, format(t("providerId"), provider.provider))), /* @__PURE__ */ React.createElement("span", { className: ProviderVisibilitySection_default["state"] }, t("active")), /* @__PURE__ */ React.createElement("label", { className: ProviderVisibilitySection_default["action"] }, /* @__PURE__ */ React.createElement("span", null, visible ? t("show") : t("hide")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        className: ProviderVisibilitySection_default["toggle"],
        checked: visible,
        disabled: !writable || pending !== void 0,
        "aria-label": format(visible ? t("hideProvider") : t("showProvider"), provider.displayName),
        onChange: () => {
          setPending(provider.provider);
          void setProviderVisible(provider.provider, !visible).finally(() => {
            setPending(void 0);
          });
        }
      }
    )));
  })), state.status === "ready" && state.providers.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: ProviderVisibilitySection_default["hint"] }, t("empty")) : null);
}

// src/client/locales.ts
var en = {
  nav: "Model list",
  title: "Model list",
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
  unavailable: "Provider display settings are unavailable.",
  loadFailed: "Loading the provider list failed",
  retry: "Retry",
  empty: "No providers are registered."
};
var zh = {
  nav: "\u6A21\u578B\u5217\u8868",
  title: "\u6A21\u578B\u5217\u8868",
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
  unavailable: "\u63D0\u4F9B\u65B9\u663E\u793A\u8BBE\u7F6E\u4E0D\u53EF\u7528\u3002",
  loadFailed: "\u52A0\u8F7D\u63D0\u4F9B\u65B9\u5217\u8868\u5931\u8D25",
  retry: "\u91CD\u8BD5",
  empty: "\u5F53\u524D\u6CA1\u6709\u5DF2\u6CE8\u518C\u7684\u63D0\u4F9B\u65B9\u3002"
};

// src/client/store.ts
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
var ProviderVisibilityStore = class {
  constructor(loadCatalog) {
    this.loadCatalog = loadCatalog;
  }
  /** Snapshot store consumed by the settings section. */
  store = (0, import_dsh_client_store.createSnapshotStore)({
    status: "idle",
    error: null,
    providers: []
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

// src/client/index.ts
var NS = "settings.providerVisibility";
var inject = ["slots", "locale", "modelDirectories", "remote", "remote.session", "sessions", "settingsScope"];
function hiddenProvidersOf(value) {
  return new Set(value?.hiddenProviders ?? []);
}
function filterDirectory(directory, hidden) {
  return {
    ...directory,
    groups: directory.groups.filter((group) => !hidden.has(group.id)),
    failures: directory.failures.filter((failure) => !hidden.has(failure.id))
  };
}
function filterModelDirectory(directory, hiddenProviders, patched, unfilteredDirectories) {
  if (patched.has(directory)) return directory;
  patched.add(directory);
  const load = directory.load.bind(directory);
  directory.load = async () => {
    const loaded = await load();
    unfilteredDirectories.set(directory, loaded);
    const filtered = filterDirectory(loaded, hiddenProviders());
    directory.store.update((state) => {
      state.groups = [...filtered.groups];
      state.failures = [...filtered.failures];
    });
    return filtered;
  };
  return directory;
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-provider-visibility: copy dictionaries");
  const directories = ctx.modelDirectories;
  const patched = /* @__PURE__ */ new WeakSet();
  const unfilteredDirectories = /* @__PURE__ */ new WeakMap();
  const scope = ctx.settingsScope.bind({
    namespace: PROVIDER_VISIBILITY_SETTINGS_NAMESPACE
  });
  const hiddenProviders = () => hiddenProvidersOf(scope.getSnapshot().value);
  const directoryFor = directories.directoryFor.bind(directories);
  directories.directoryFor = (sessionId) => filterModelDirectory(
    directoryFor(sessionId),
    hiddenProviders,
    patched,
    unfilteredDirectories
  );
  const controller = new ProviderVisibilityStore(async () => {
    const response = await ctx.remote.session.modelCatalog();
    if (!response.ok) throw new Error(response.error.message);
    return response.value;
  });
  const setProviderVisible = async (provider, visible) => {
    const current = scope.getSnapshot().value;
    if (current === void 0) return;
    const hidden = hiddenProvidersOf(current);
    if (visible) hidden.delete(provider);
    else hidden.add(provider);
    await scope.set("hiddenProviders", [...hidden].sort());
  };
  const t = ctx.locale.bind(NS);
  const injected = () => ({
    controller,
    hooks: { snapshot: controller.store },
    settings: scope,
    setProviderVisible,
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
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "model-list",
    order: 15,
    label: () => t("nav"),
    inject: injected
  }, ProviderVisibilitySection));
}

    return module.exports
  },
})
