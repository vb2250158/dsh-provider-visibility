/** 从已记录的路由通知与实际回复来源重建重定向尾注。 */
import { z } from 'zod';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
export declare const REDIRECT_PRODUCER = "dsh-provider-visibility";
export declare const redirectRecordSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    from: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    to: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RedirectRecord = z.infer<typeof redirectRecordSchema>;
declare const stateSchema: z.ZodObject<{
    current: z.ZodNullable<z.ZodObject<{
        version: z.ZodLiteral<1>;
        from: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
        to: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    messages: z.ZodRecord<z.ZodString, z.ZodObject<{
        version: z.ZodLiteral<1>;
        from: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
        to: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type RedirectHistoryState = z.infer<typeof stateSchema>;
declare const runningSchema: z.ZodNullable<z.ZodObject<{
    turn: z.ZodNumber;
    step: z.ZodNumber;
    record: z.ZodNullable<z.ZodObject<{
        version: z.ZodLiteral<1>;
        from: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
        to: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>>;
type RunningRedirect = z.infer<typeof runningSchema>;
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionStateMap {
        modelRedirects: RedirectHistoryState;
    }
    interface SessionProjectionMap {
        modelRedirects: RedirectHistoryState['messages'];
    }
    interface SessionProjectionStateMap {
        runningModelRedirect: RunningRedirect;
    }
    interface SessionProjectionMap {
        runningModelRedirect: RunningRedirect;
    }
}
/** 只给来源与路由通知一致的实际模型回复添加尾注，失败请求不产生回复记录。 */
export declare function foldRedirectHistory(state: RedirectHistoryState, event: SessionEvent): RedirectHistoryState;
/** 投影只读取会话记录；修改规则不会重算已有回复的路由。 */
export declare const redirectHistoryProjection: {
    key: "modelRedirects";
    stateSchema: z.ZodObject<{
        current: z.ZodNullable<z.ZodObject<{
            version: z.ZodLiteral<1>;
            from: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
            to: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        messages: z.ZodRecord<z.ZodString, z.ZodObject<{
            version: z.ZodLiteral<1>;
            from: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
            to: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    stateVersion: number;
    init: () => {
        current: null;
        messages: {};
    };
    apply: typeof foldRedirectHistory;
    wire: {
        viewSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
            version: z.ZodLiteral<1>;
            from: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
            to: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        view: (state: NoInfer<{
            current: {
                version: 1;
                from: {
                    provider: string;
                    model: string;
                };
                to: {
                    provider: string;
                    model: string;
                };
            } | null;
            messages: Record<string, {
                version: 1;
                from: {
                    provider: string;
                    model: string;
                };
                to: {
                    provider: string;
                    model: string;
                };
            }>;
        }>) => Record<string, {
            version: 1;
            from: {
                provider: string;
                model: string;
            };
            to: {
                provider: string;
                model: string;
            };
        }>;
    };
};
/** 当前请求的重定向通知按轮次和步骤定位，下一步开始即清除旧通知。 */
export declare const runningRedirectProjection: {
    key: "runningModelRedirect";
    stateSchema: z.ZodNullable<z.ZodObject<{
        turn: z.ZodNumber;
        step: z.ZodNumber;
        record: z.ZodNullable<z.ZodObject<{
            version: z.ZodLiteral<1>;
            from: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
            to: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    stateVersion: number;
    init: () => null;
    apply: (state: NoInfer<{
        turn: number;
        step: number;
        record: {
            version: 1;
            from: {
                provider: string;
                model: string;
            };
            to: {
                provider: string;
                model: string;
            };
        } | null;
    } | null>, event: SessionEvent) => {
        turn: number;
        step: number;
        record: {
            version: 1;
            from: {
                provider: string;
                model: string;
            };
            to: {
                provider: string;
                model: string;
            };
        } | null;
    } | null;
    wire: {
        viewSchema: z.ZodNullable<z.ZodObject<{
            turn: z.ZodNumber;
            step: z.ZodNumber;
            record: z.ZodNullable<z.ZodObject<{
                version: z.ZodLiteral<1>;
                from: z.ZodObject<{
                    provider: z.ZodString;
                    model: z.ZodString;
                }, z.core.$strip>;
                to: z.ZodObject<{
                    provider: z.ZodString;
                    model: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        view: (state: NoInfer<{
            turn: number;
            step: number;
            record: {
                version: 1;
                from: {
                    provider: string;
                    model: string;
                };
                to: {
                    provider: string;
                    model: string;
                };
            } | null;
        } | null>) => {
            turn: number;
            step: number;
            record: {
                version: 1;
                from: {
                    provider: string;
                    model: string;
                };
                to: {
                    provider: string;
                    model: string;
                };
            } | null;
        } | null;
    };
};
export {};
