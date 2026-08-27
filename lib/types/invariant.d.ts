/** Package-owned invariant companion for provider visibility. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "client-ui-provider-visibility-invariant";
/** Service required by the companion. */
export declare const inject: string[];
/** Register the package invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map
