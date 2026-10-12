/** Domain decoding over the shared Host mirror; writes retain the platform queue. */
import type { ConfigForm, SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { ProviderVisibilitySettings } from '../provider-visibility.ts';
/** Narrow plugin values without executing a serialized Host transform.
 * @param source - Shared form owning revision-fenced writes.
 * @param mirror - Shared, redacted configuration reader.
 * @returns Domain form and subscription disposer.
 */
export declare function createVisibilityForm(source: ConfigForm<ProviderVisibilitySettings>, mirror: SettingsDescribeFace): {
    form: ConfigForm<ProviderVisibilitySettings>;
    dispose: () => void;
};
