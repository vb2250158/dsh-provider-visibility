/** 规则编辑行为测试保留原控件的名称、禁用和点击语义。 */
export const Button = ({ variant, size, ...props }) => <button {...props} />
export const Switch = ({ checked, onChange, label, disabled }) => <button role="switch" aria-label={label} aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} />
