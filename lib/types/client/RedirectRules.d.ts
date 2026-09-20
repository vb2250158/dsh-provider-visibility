/** 重定向规则编辑器；模型下拉由模型选择插件提供。 */
import * as React from 'react';
import type { ModelCatalog, ModelSelection } from '@deepseek-ai/dsh-api-remotes/client';
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots';
import { type RedirectRule } from '../redirect-rules.ts';
import type { ProviderVisibilityKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.model-redirect.picker': {
            kind: 'single';
            scope: 'root';
            owner: {
                groups: ModelCatalog['groups'];
                current: ModelSelection | null;
                locked: boolean;
                select: (selection: ModelSelection) => void;
            };
        };
    }
}
interface Props extends PropsRenderSlots<'settings.model-redirect.picker'> {
    groups: ModelCatalog['groups'];
    rules: readonly RedirectRule[];
    writable: boolean;
    save: (rules: RedirectRule[]) => Promise<void>;
    t: (key: ProviderVisibilityKey) => string;
}
/** 以提供商和模型的目录显示名称呈现规则，缺失目录时保留 id。 */
export declare function routeName(groups: ModelCatalog['groups'], provider: string, model?: string): string;
/** 保存成功才清空草稿；移除只改规则，不改已有会话。 */
export declare function RedirectRules({ groups, rules, writable, save, t, renderSlot }: Props): React.JSX.Element;
export {};
