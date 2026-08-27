/** Package-owned invariant companion for provider visibility. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-provider-visibility'

/** Cordis companion plugin name. */
export const name = 'client-ui-provider-visibility-invariant'
/** Service required by the companion. */
export const inject = ['invariants']

/**
 * No runtime invariant: the Host policy and the browser settings page share
 * the settings namespace, while catalog filtering is covered by API tests.
 */
const install: InvariantInstaller = () => {}

/** Register the package invariant companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
