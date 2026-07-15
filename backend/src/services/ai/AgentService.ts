/**
 * AI Agent Service - סוכן חכם עם יכולת הפעלת כלים
 * משתמש ב-OpenAI function calling
 */

import OpenAI from 'openai';
import { AGENT_TOOLS, AgentToolExecutor } from './AgentTools';
import { AuditService } from '../AuditService';
import { eventBus } from '../EventBus';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `אתה "לאה" - מזכירה חכמה של חברת הובלות שמשתמשת בפלטפורמת Movalo.

תפקידך:
1. לעזור לנהל לידים והזמנות
2. להפיק הצעות מחיר וחשבוניות
3. לעקוב אחרי שלבי ההובלה
4. לנתח נתונים עסקיים
5. לסייע במעקב אחרי לקוחות

כללי התנהגות:
- דבר בעברית תקנית ומקצועית
- היה יעיל - אל תשאל יותר מדי שאלות, פעל
- כשאתה מבצע פעולה, דווח בקצרה על התוצאה
- אם משהו לא ברור, שאל שאלה ממוקדת אחת
- תן המלצות פרואקטיביות כשזה רלוונטי
- השתמש בכלים הזמינים לך לביצוע פעולות

אתה יכול:
- לצפות ולחפש הזמנות ולקוחות
- לעדכן סטטוס הזמנות
- להפיק ולשלוח הצעות מחיר
- להפיק חשבוניות וקבלות
- לעדכן שלבי מעקב הובלה
- לסווג לידים חדשים
- ליצור טיוטות הודעות follow-up
- להציג סטטיסטיקות ונתונים
- לחשב אומדן מחיר בשקלים דרך הכלי estimate_price (אל תמציא מחירים)
- לקבל המלצות תמחור לשוק הישראלי דרך get_pricing_recommendations`;

export interface AgentMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    tool_call_id?: string;
    tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
    }>;
}

export interface AgentResponse {
    message: string;
    toolsUsed: string[];
    tokensUsed: number;
}

export interface AgentOptions {
    /** מצב טורבו AI - משתמש במודל מהיר יותר. */
    turboAi?: boolean;
}

export class AgentService {
    private tenantId?: string;
    private userId?: string;
    private conversationHistory: AgentMessage[] = [];
    private toolExecutor: AgentToolExecutor;
    private turboAi: boolean;

    constructor(tenantId?: string, userId?: string, options: AgentOptions = {}) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.turboAi = !!options.turboAi;
        this.toolExecutor = new AgentToolExecutor(tenantId);
        this.conversationHistory.push({
            role: 'system',
            content: SYSTEM_PROMPT
        });
    }

    /** מודל מהיר בטורבו, מודל מאוזן אחרת. */
    private getModel(): string {
        return this.turboAi ? 'gpt-4.1-nano' : 'gpt-4o-mini';
    }

    /** מעדכן את דגל הטורבו (למשל אחרי שינוי בהגדרות בלי לאפס שיחה). */
    setTurboAi(enabled: boolean): void {
        this.turboAi = !!enabled;
    }

    /**
     * Process a user message and return agent response
     */
    async chat(userMessage: string, maxToolCalls = 5): Promise<AgentResponse> {
        if (!process.env.OPENAI_API_KEY) {
            return {
                message: 'שירות ה-AI לא זמין כרגע. נא להגדיר OPENAI_API_KEY.',
                toolsUsed: [],
                tokensUsed: 0
            };
        }

        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        const toolsUsed: string[] = [];
        let totalTokens = 0;
        let iterations = 0;

        while (iterations < maxToolCalls) {
            iterations++;

            try {
                const response = await openai.chat.completions.create({
                    model: this.getModel(),
                    messages: this.conversationHistory as any,
                    tools: AGENT_TOOLS,
                    tool_choice: 'auto',
                    temperature: this.turboAi ? 0.4 : 0.7,
                    max_tokens: this.turboAi ? 1000 : 1500
                });

                const message = response.choices[0].message;
                totalTokens += response.usage?.total_tokens || 0;

                // If no tool calls, return the final response
                if (!message.tool_calls || message.tool_calls.length === 0) {
                    const assistantMessage = message.content || '';
                    this.conversationHistory.push({
                        role: 'assistant',
                        content: assistantMessage
                    });

                    // Log AI chat event
                    eventBus.emit('ai.chat', {
                        tenantId: this.tenantId,
                        userId: this.userId,
                        messageCount: this.conversationHistory.length,
                        tokensUsed: totalTokens
                    });

                    AuditService.log({
                        tenantId: this.tenantId,
                        userId: this.userId,
                        action: 'ai_chat',
                        resource: 'session',
                        details: {
                            userMessage: userMessage.slice(0, 200),
                            toolsUsed,
                            tokensUsed: totalTokens
                        }
                    });

                    return {
                        message: assistantMessage,
                        toolsUsed,
                        tokensUsed: totalTokens
                    };
                }

                // Process tool calls
                this.conversationHistory.push({
                    role: 'assistant',
                    content: message.content || '',
                    tool_calls: message.tool_calls.map(tc => ({
                        id: tc.id,
                        type: tc.type,
                        function: {
                            name: tc.function.name,
                            arguments: tc.function.arguments
                        }
                    }))
                });

                // Execute each tool call
                for (const toolCall of message.tool_calls) {
                    const toolName = toolCall.function.name;
                    toolsUsed.push(toolName);

                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        console.log(`[AgentService] Executing tool: ${toolName}`, args);
                        
                        const result = await this.toolExecutor.execute(toolName, args);
                        
                        this.conversationHistory.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify(result, null, 2)
                        });
                    } catch (err: any) {
                        console.error(`[AgentService] Tool error: ${toolName}`, err.message);
                        this.conversationHistory.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({ error: err.message })
                        });
                    }
                }

            } catch (err: any) {
                console.error('[AgentService] OpenAI error:', err.message);
                return {
                    message: 'אירעה שגיאה בעיבוד הבקשה. נסה שוב מאוחר יותר.',
                    toolsUsed,
                    tokensUsed: totalTokens
                };
            }
        }

        return {
            message: 'הגעתי למגבלת פעולות. האם יש עוד משהו שאוכל לעזור בו?',
            toolsUsed,
            tokensUsed: totalTokens
        };
    }

    /**
     * Reset conversation history
     */
    resetConversation(): void {
        this.conversationHistory = [{
            role: 'system',
            content: SYSTEM_PROMPT
        }];
    }

    /**
     * Get conversation history (for UI display)
     */
    getHistory(): AgentMessage[] {
        return this.conversationHistory.filter(m => m.role !== 'system' && m.role !== 'tool');
    }
}

// Customer-facing readonly agent (for tracking page)
const CUSTOMER_SYSTEM_PROMPT = `אתה עוזר וירטואלי של חברת הובלות.

תפקידך לענות על שאלות של לקוחות לגבי ההובלה שלהם:
- מה הסטטוס של ההובלה?
- מתי ההובלה מתוכננת?
- איפה נמצאת המשאית?
- מה כלול בהצעת המחיר?

כללים:
- דבר בעברית ידידותית ומקצועית
- תן מידע מדויק לפי הנתונים שיש לך
- אם אין לך מידע - אמור את זה בנימוס
- אל תבצע שינויים - רק לספק מידע
- הפנה ללקוח להתקשר אם יש צורך בשינוי`;

export class CustomerAgentService {
    private trackingToken: string;
    private estimateData: any;

    constructor(trackingToken: string, estimateData: any) {
        this.trackingToken = trackingToken;
        this.estimateData = estimateData;
    }

    async chat(userMessage: string): Promise<string> {
        if (!process.env.OPENAI_API_KEY) {
            return 'שירות העוזר הוירטואלי לא זמין כרגע. לשאלות התקשר 054-7777623.';
        }

        const contextInfo = `
פרטי ההובלה:
- שם לקוח: ${this.estimateData.name}
- תאריך הובלה: ${this.estimateData.preferredMoveDate ? new Date(this.estimateData.preferredMoveDate).toLocaleDateString('he-IL') : 'לא נקבע'}
- כתובת מוצא: ${this.estimateData.currentAddress || 'לא צוין'}
- כתובת יעד: ${this.estimateData.destinationAddress || 'לא צוין'}
- סטטוס: ${this.getStatusLabel(this.estimateData.status)}
- שלב נוכחי: ${this.getStageLabel(this.estimateData.stage)}
- מחיר: ${this.estimateData.totalPrice?.toLocaleString('he-IL')}₪
`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: CUSTOMER_SYSTEM_PROMPT + '\n\n' + contextInfo },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content || 'מצטער, לא הצלחתי לעבד את השאלה.';
        } catch (err) {
            console.error('[CustomerAgentService] Error:', err);
            return 'אירעה שגיאה. לשאלות התקשר 054-7777623.';
        }
    }

    private getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pending: 'ממתין לאישור',
            approved: 'מאושר',
            rejected: 'נדחה',
            completed: 'הושלם'
        };
        return labels[status] || status;
    }

    private getStageLabel(stage: string): string {
        const labels: Record<string, string> = {
            order_placed: 'הזמנה התקבלה',
            packing: 'אריזה',
            loading: 'העמסה',
            in_transit: 'בדרך',
            unloading: 'פריקה',
            delivered: 'נמסר'
        };
        return labels[stage] || stage || 'הזמנה התקבלה';
    }
}
