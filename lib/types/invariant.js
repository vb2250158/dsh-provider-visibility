/** Package-owned invariant companion for provider visibility. */
const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-provider-visibility';
/** Cordis companion plugin name. */
export const name = 'client-ui-provider-visibility-invariant';
/** Service required by the companion. */
export const inject = ['invariants'];
/**
 * No runtime invariant: the Host policy and the browser settings page share
 * the settings namespace, while catalog filtering is covered by API tests.
 */
const install = () => { };
/** Register the package invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map
