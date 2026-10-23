/** 在步骤准备前解析有效模型，保留用户选择和请求级通知。 */
import type { Context } from '@deepseek-ai/cordis';
import { type RedirectRule } from './redirect-rules.ts';
/** 规则在工具和提示词装配前固定；用户的新选择留给下一步。 */
export declare function installRedirects(ctx: Context, getRules: () => readonly RedirectRule[]): Promise<void>;
