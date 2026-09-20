/** Settings page that controls provider visibility in model selectors. */
import type { ReactNode } from 'react';
import type { InjectFace, PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { ProviderVisibilitySettings } from '../provider-visibility.ts';
import type { ProviderVisibilityStore } from './store.ts';
import type { ProviderVisibilityKey } from './locales.ts';
import type { RedirectRule } from '../redirect-rules.ts';
/** Injected dependencies for the settings section. */
export interface ProviderVisibilitySectionInjected {
    controller: ProviderVisibilityStore;
    hooks: {
        /** Provider directory snapshot bound by the platform renderer. */
        snapshot: ProviderVisibilityStore['store'];
    };
    /** Durable visibility settings for this settings page. */
    settings: SettingsScope<ProviderVisibilitySettings>;
    setProviderVisible: (provider: string, visible: boolean) => Promise<void>;
    saveRedirects: (rules: RedirectRule[]) => Promise<void>;
    t: (key: ProviderVisibilityKey) => string;
}
/** Slot props delivered by the settings shell. */
export type ProviderVisibilitySectionProps = Partial<InjectFace<ProviderVisibilitySectionInjected>> & PropsRenderSlots<'settings.model-redirect.picker'>;
/** Render the provider visibility settings page. */
export declare function ProviderVisibilitySection(props: ProviderVisibilitySectionProps): ReactNode;
