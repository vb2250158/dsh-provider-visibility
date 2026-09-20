/** 模型重定向的持久化规则与单次匹配。 */
export interface ModelRoute {
    provider: string;
    model: string;
}
/** 省略 sourceModel 时匹配该提供商的全部模型。 */
export interface RedirectRule {
    sourceProvider: string;
    sourceModel?: string;
    targetProvider: string;
    targetModel: string;
}
/** 校验规则集合；重复来源和自指规则在保存时拒绝。 */
export declare function validateRedirectRules(rules: readonly RedirectRule[]): void;
/** 精确模型优先于提供商规则；每次请求只匹配一次，不递归重定向。 */
export declare function redirectRoute(source: ModelRoute, rules: readonly RedirectRule[]): ModelRoute;
/** 比较提供商和模型，不混入推理档位。 */
export declare function sameRoute(left: ModelRoute | null | undefined, right: ModelRoute | null | undefined): boolean;
