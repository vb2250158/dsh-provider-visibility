/** Copy for the provider-display settings page. */
export declare const en: {
    readonly 'redirect.title': "Model redirects";
    readonly 'redirect.hint': "Exact model rules take priority. Each request redirects once and keeps the selected model. Removing a rule restores the original route. Replies retain the actual route.";
    readonly 'redirect.all': "All models from this provider";
    readonly 'redirect.from': "Original provider and model";
    readonly 'redirect.to': "Destination provider and model";
    readonly 'redirect.add': "Add rule";
    readonly 'redirect.remove': "Remove";
    readonly 'redirect.none': "No redirect rules.";
    readonly 'redirect.duplicate': "A rule already exists for this source. Remove it before adding another.";
    readonly 'redirect.self': "The destination must differ from the source.";
    readonly 'redirect.empty': "Choose both the source and destination.";
    readonly 'redirect.badge': "Redirected";
    readonly nav: "Model list";
    readonly title: "Model list";
    readonly intro: "Choose which providers appear in the model selector.";
    readonly hiddenHint: "Hidden providers remain available to existing routes and direct model requests.";
    readonly show: "Show";
    readonly hide: "Hide";
    readonly showProvider: "Show {provider}";
    readonly hideProvider: "Hide {provider}";
    readonly active: "Available";
    readonly inactive: "Not configured";
    readonly providerId: "Provider ID: {provider}";
    readonly readOnly: "Provider display settings are read-only in this deployment.";
    readonly unavailable: "Provider display settings are unavailable.";
    readonly loadFailed: "Loading the provider list failed";
    readonly retry: "Retry";
    readonly empty: "No providers are registered.";
};
export type ProviderVisibilityKey = keyof typeof en;
export declare const zh: {
    [Key in ProviderVisibilityKey]: string;
};
