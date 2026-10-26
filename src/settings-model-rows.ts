/** Model data passed between independently loaded plugin JavaScript realms. */

/** Detach validated JSON model rows for the settings service's plain-object parser.
 * @param rows - Model rows already validated by configuration or API discovery.
 * @returns Independent rows with realm-neutral record prototypes; arrays retain their contents.
 */
export function settingsModelRows(rows: readonly object[]): object[] {
  const detached = structuredClone([...rows])
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== 'object') return
    if (!Array.isArray(value)) Object.setPrototypeOf(value, null)
    for (const child of Object.values(value)) visit(child)
  }
  visit(detached)
  return detached
}
