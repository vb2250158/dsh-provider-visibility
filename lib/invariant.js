//#region lib/types/invariant.js
/** Package-owned invariant companion for provider visibility. */
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-provider-visibility";
/** Cordis companion plugin name. */
const name = "client-ui-provider-visibility-invariant";
/** Service required by the companion. */
const inject = ["invariants"];
/**
* No runtime invariant: the Host policy and the browser settings page share
* the settings namespace, while catalog filtering is covered by API tests.
*/
const install = () => {};
/** Register the package invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
