/** Browser half of the provider-display settings plugin. */
import { PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from "../provider-visibility.js";
import { ProviderVisibilitySection } from "./ProviderVisibilitySection.js";
import { en, zh } from "./locales.js";
import { ProviderVisibilityStore } from "./store.js";
const NS = 'settings.providerVisibility';
/** Browser services required by this plugin. */
export const inject = ['slots', 'locale', 'connection', 'remote', 'settingsScope'];
function hiddenProvidersOf(value) {
    return new Set(value?.hiddenProviders ?? []);
}
//# sourceMappingURL=index.js.map
/** Register the Model list page and keep its provider directory current. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-provider-visibility: copy dictionaries');
    const connection = ctx.get('connection');
    const controller = new ProviderVisibilityStore(connection.api);
    const scope = ctx.settingsScope.bind({
        namespace: PROVIDER_VISIBILITY_SETTINGS_NAMESPACE,
    });
    const setProviderVisible = async (provider, visible) => {
        const current = scope.getSnapshot().value;
        if (current === undefined)
            return;
        const hidden = hiddenProvidersOf(current);
        if (visible)
            hidden.delete(provider);
        else
            hidden.add(provider);
        await scope.set('hiddenProviders', [...hidden].sort());
    };
    const t = ctx.locale.bind(NS);
    const injected = () => ({
        controller,
        hooks: { snapshot: controller.store, settingsSnapshot: scope },
        setProviderVisible,
        t,
    });
    ctx.effect(() => {
        const refresh = () => {
            if (controller.store.getSnapshot().status !== 'idle')
                void controller.load();
        };
        const disposers = [
            ctx.remote.$on('llm/adapters-updated', refresh),
            ctx.remote.$on('settings/document-updated', refresh),
            ctx.on('connection/reset', refresh),
        ];
        return () => { for (const dispose of disposers)
            dispose(); };
    }, 'ui-provider-visibility: provider directory invalidations');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'model-list',
        order: 15,
        label: () => t('nav'),
        inject: injected,
    }, ProviderVisibilitySection));
}
