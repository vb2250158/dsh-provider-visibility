/** Copy for the provider-display settings page. */
export declare const en: {
    readonly nav: "Model list";
    readonly title: "Model list";
    readonly intro: "Choose which providers appear in the model selector.";
    readonly hiddenHint: "Hidden providers remain available to existing routes and direct model requests.";
    readonly show: "Show";
    readonly hide: "Hide";
    readonly showProvider: "Show {provider}";
    readonly hideProvider: "Hide {provider}";
    readonly active: "Available";
    readonly providerId: "Provider ID: {provider}";
    readonly readOnly: "Provider display settings are read-only in this deployment.";
    readonly unavailable: "Provider display settings are unavailable.";
    readonly loadFailed: "Loading the provider list failed";
    readonly retry: "Retry";
    readonly empty: "No providers are configured.";
};
/** Translation keys used by the provider-visibility settings page. */
export type ProviderVisibilityKey = keyof typeof en;
/** Chinese provider-visibility settings copy. */
export declare const zh: {
    [Key in ProviderVisibilityKey]: string;
};
//# sourceMappingURL=locales.d.ts.map
