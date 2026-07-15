/**
 * AI Assistant Panel - רכיב סוכן AI לדשבורד הטנאנט
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useTenantApi } from '@/hooks/useTenantApi';
import { useTurboMode } from '@/contexts/TurboModeContext';
import { Button } from '@/components/ui/button';
import { 
    Bot, Send, Loader2, RefreshCw, Sparkles, 
    ListChecks, TrendingUp, Users, Zap
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    toolsUsed?: string[];
}

const QUICK_ACTIONS = [
    { label: 'הזמנות היום', prompt: 'הראה לי את ההזמנות מהיום', icon: ListChecks },
    { label: 'לידים דחופים', prompt: 'יש לידים דחופים שצריך לטפל בהם?', icon: Sparkles },
    { label: 'אומדן מחיר', prompt: 'חשב אומדן מחיר להזמנה האחרונה עם פירוק גורמים', icon: Zap },
    { label: 'סיכום עסקי', prompt: 'תן לי סיכום עסקי של השבוע האחרון', icon: TrendingUp },
    { label: 'לקוחות חדשים', prompt: 'מי הלקוחות החדשים השבוע?', icon: Users },
];

export function AiAssistantPanel() {
    const { call } = useTenantApi();
    const { isActive } = useTurboMode();
    const turboAi = isActive('turboAi');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (message: string) => {
        if (!message.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: message };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await call<{ success: boolean; data: { message: string; toolsUsed: string[] } }>(
                '/ai/chat',
                { method: 'POST', body: JSON.stringify({ message }) }
            );

            if (response.ok && response.data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: response.data.data.message,
                    toolsUsed: response.data.data.toolsUsed
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'מצטער, אירעה שגיאה. נסה שוב.'
                }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'שגיאת תקשורת. בדוק את החיבור לאינטרנט.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const resetChat = async () => {
        await call('/ai/reset', { method: 'POST' });
        setMessages([]);
    };

    // Minimized floating button
    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
                aria-label="פתח עוזרת AI"
            >
                <Bot className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                <span className="absolute left-full ml-3 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    לאה - עוזרת AI
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: '500px', maxHeight: 'calc(100vh - 6rem)' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <div>
                        <h3 className="font-semibold text-sm flex items-center gap-1.5">
                            לאה - מזכירה חכמה
                            {turboAi && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-amber-400/90 text-amber-950 rounded px-1.5 py-0.5">
                                    <Zap className="h-2.5 w-2.5" /> טורבו
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-blue-100">
                            {turboAi ? 'מצב מהיר פעיל' : 'מוכנה לעזור לך'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={resetChat}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition"
                        title="התחל שיחה חדשה"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setExpanded(false)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition text-lg"
                        title="מזער"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" dir="rtl">
                {messages.length === 0 && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-gray-600 text-sm mb-4">שלום! אני לאה, המזכירה החכמה שלך.</p>
                        <p className="text-gray-500 text-xs mb-4">אני יכולה לעזור לך לנהל הזמנות, להפיק חשבוניות, לעקוב אחרי לקוחות ועוד.</p>
                        
                        {/* Quick actions */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {QUICK_ACTIONS.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(action.prompt)}
                                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition text-right"
                                >
                                    <action.icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        פעולות: {msg.toolsUsed.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-end">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">חושבת...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
                <div className="flex gap-2" dir="rtl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="שאל אותי משהו..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
