/** 模型重定向的持久化规则与单次匹配。 */
export interface ModelRoute {
  provider: string
  model: string
}

/** 省略 sourceModel 时匹配该提供商的全部模型。 */
export interface RedirectRule {
  sourceProvider: string
  sourceModel?: string
  targetProvider: string
  targetModel: string
}

/** 校验规则集合；重复来源和自指规则在保存时拒绝。 */
export function validateRedirectRules(rules: readonly RedirectRule[]): void {
  const sources = new Set<string>()
  for (const rule of rules) {
    if (![rule.sourceProvider, rule.targetProvider, rule.targetModel].every(value => value.trim().length > 0)
      || rule.sourceModel !== undefined && rule.sourceModel.trim().length === 0) throw new Error('redirect.empty')
    const key = JSON.stringify([rule.sourceProvider, rule.sourceModel ?? null])
    if (sources.has(key)) throw new Error('redirect.duplicate')
    sources.add(key)
    if (rule.sourceProvider === rule.targetProvider && (rule.sourceModel === undefined || rule.sourceModel === rule.targetModel)) {
      throw new Error('redirect.self')
    }
  }
}

/** 精确模型优先于提供商规则；每次请求只匹配一次，不递归重定向。 */
export function redirectRoute(source: ModelRoute, rules: readonly RedirectRule[]): ModelRoute {
  const rule = rules.find(rule => rule.sourceProvider === source.provider && rule.sourceModel === source.model)
    ?? rules.find(rule => rule.sourceProvider === source.provider && rule.sourceModel === undefined)
  return rule === undefined ? source : { provider: rule.targetProvider, model: rule.targetModel }
}

/** 比较提供商和模型，不混入推理档位。 */
export function sameRoute(left: ModelRoute | null | undefined, right: ModelRoute | null | undefined): boolean {
  return left != null && right != null && left.provider === right.provider && left.model === right.model
}
