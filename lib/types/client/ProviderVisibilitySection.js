import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Settings page that controls provider visibility in model selectors. */
import { useEffect, useState } from 'react';
import { DEFAULT_HIDDEN_PROVIDERS } from "../provider-visibility.js";
import styles from './ProviderVisibilitySection.module.css';
function format(template, provider) {
    return template.replace('{provider}', () => provider);
}
/** Render the provider visibility settings page. */
export function ProviderVisibilitySection(props) {
    const { controller, useSnapshot, useSettingsSnapshot, setProviderVisible, t } = props;
    if (controller === undefined || useSnapshot === undefined || useSettingsSnapshot === undefined
        || setProviderVisible === undefined || t === undefined)
        return null;
    return _jsx(Loaded, { injected: { controller, useSnapshot, useSettingsSnapshot, setProviderVisible, t } });
}
function Loaded({ injected }) {
    const { controller, setProviderVisible, t } = injected;
    const state = injected.useSnapshot(snapshot => snapshot);
    const settings = injected.useSettingsSnapshot(snapshot => snapshot);
    const [pending, setPending] = useState(undefined);
    useEffect(() => {
        if (state.status === 'idle')
            void controller.load();
    }, [controller, state.status]);
    if (state.status === 'error') {
        return (_jsxs("div", { className: styles['section'], children: [_jsx("p", { className: styles['error'], children: `${t('loadFailed')}: ${state.error ?? ''}` }), _jsx("button", { type: "button", className: styles['retry'], onClick: () => { void controller.load(); }, children: t('retry') })] }));
    }
    const hidden = new Set(settings.value?.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS);
    const writable = settings.status === 'ready' && settings.writable;
    const settingsNotice = settings.status === 'unavailable'
        ? t('unavailable')
        : settings.status === 'ready' && !settings.writable
            ? t('readOnly')
            : undefined;
    return (_jsxs("div", { className: styles['section'], children: [_jsx("h2", { className: styles['title'], children: t('title') }), _jsx("p", { className: styles['intro'], children: t('intro') }), _jsx("p", { className: styles['hint'], children: t('hiddenHint') }), settingsNotice === undefined ? null : _jsx("p", { className: styles['notice'], children: settingsNotice }), _jsx("ul", { className: styles['rows'], children: state.providers.map((provider) => {
                    const visible = !hidden.has(provider.provider);
                    return (_jsxs("li", { className: styles['row'], children: [_jsxs("span", { className: styles['identity'], children: [_jsx("span", { className: styles['name'], children: provider.displayName }), _jsx("span", { className: styles['meta'], children: format(t('providerId'), provider.provider) })] }), _jsx("span", { className: styles['state'], children: t('active') }), _jsxs("label", { className: styles['action'], children: [_jsx("span", { children: visible ? t('show') : t('hide') }), _jsx("input", { type: "checkbox", className: styles['toggle'], checked: visible, disabled: !writable || pending !== undefined, "aria-label": format(visible ? t('hideProvider') : t('showProvider'), provider.displayName), onChange: () => {
                                            setPending(provider.provider);
                                            void setProviderVisible(provider.provider, !visible).finally(() => { setPending(undefined); });
                                        } })] })] }, provider.provider));
                }) }), state.status === 'ready' && state.providers.length === 0 ? _jsx("p", { className: styles['hint'], children: t('empty') }) : null] }));
}
//# sourceMappingURL=ProviderVisibilitySection.js.map
