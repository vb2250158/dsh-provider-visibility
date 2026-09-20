/** 在模型请求准备前应用重定向，保留来源选择及请求级存档。 */
import type { Context } from '@deepseek-ai/cordis';
import { type RedirectRule } from './redirect-rules.ts';
/** 规则与来源在提示词装配时固定；装配期间的设置变化留到下一步。 */
export declare function installRedirects(ctx: Context, getRules: () => readonly RedirectRule[]): void;
