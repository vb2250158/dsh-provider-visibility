import type { ProviderVisibilitySettings } from './provider-visibility.ts';
/** Settings namespace owned by the provider-display plugin. */
export declare const PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "llm-provider-visibility";
/** Providers hidden only after the user chooses them. */
export declare const DEFAULT_HIDDEN_PROVIDERS: readonly [];
/** 解析主机返回的设置值，不执行序列化 schema 中丢失闭包的转换函数。
 * @param value - 设置接口返回的命名空间值。
 * @returns 有效设置；字段或规则无效时返回 undefined。
 */
export declare function decodeProviderVisibility(value: unknown): ProviderVisibilitySettings | undefined;
