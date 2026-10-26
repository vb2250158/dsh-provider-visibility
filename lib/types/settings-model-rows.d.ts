/** Model data passed between independently loaded plugin JavaScript realms. */
/** Detach validated JSON model rows for the settings service's plain-object parser.
 * @param rows - Model rows already validated by configuration or API discovery.
 * @returns Independent rows with realm-neutral record prototypes; arrays retain their contents.
 */
export declare function settingsModelRows(rows: readonly object[]): object[];
