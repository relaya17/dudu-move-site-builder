import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiAnalysisService } from '@/services/AiAnalysisService';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const QUICK_ACTIONS = [
    { icon: TrendingUp, label: 'תובנות עסקיות', query: 'תן לי תובנות עסקיות חשובות לחודש הנוכחי' },
    { icon: DollarSign, label: 'המלצות מחיר', query: 'מה ההמלצות שלך לאופטימיזציית מחירים?' },
    { icon: Calendar, label: 'ניהול לוחות זמנים', query: 'אילו ימים הם הכי עמוסים ואיך לנהל את לוח הזמנים בצורה יעילה?' },
    { icon: Sparkles, label: 'שיפור שיווק', query: 'תן לי 3 רעיונות יצירתיים לשיפור השיווק של החברה' },
];

const GREETING: ChatMessage = {
    role: 'assistant',
    content: 'שלום! אני לאה, המזכירה החכמה שלך 👋\n\nאני כאן כדי לעזור לך לנהל את דוד הובלות בצורה חכמה ויעילה. אוכל לעזור לך עם:\n• ניתוח נתונים עסקיים\n• המלצות על מחירים ולוחות זמנים\n• ניהול הובלות ולקוחות\n• כל שאלה שתרצה!\n\nמה תרצה לדעת?',
    timestamp: new Date(),
};

export const AiAssistant = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (query: string) => {
        if (!query.trim() || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: query.trim(), timestamp: new Date() };
        const history = messages
            .filter(m => m !== GREETING)
            .map(m => ({ role: m.role, content: m.content }));

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const result = await AiAnalysisService.generateCustomAnalysis(query.trim(), history);
            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: result.analysis ?? 'לא התקבלה תשובה',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'מצטערת, נתקלתי בשגיאה. אנא נסה שוב.',
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const resetChat = () => {
        setMessages([GREETING]);
        setInput('');
    };

    return (
        <Card className="w-full flex flex-col" style={{ height: '75vh', minHeight: 480 }}>
            <CardHeader className="pb-3 border-b bg-gradient-to-l from-blue-600 to-indigo-700 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Bot size={22} aria-hidden="true" />
                        לאה — מזכירה AI
                    </CardTitle>
                    <button
                        onClick={resetChat}
                        title="שיחה חדשה"
                        aria-label="פתח שיחה חדשה"
                        className="text-white/70 hover:text-white transition-colors p-1 rounded"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
                <p className="text-blue-100 text-xs mt-0.5">מנתחת נתוני העסק ועונה בעברית</p>
            </CardHeader>

            {/* אזור ההודעות */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        dir="rtl"
                    >
                        {/* אווטאר */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                            msg.role === 'assistant'
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                : 'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}>
                            {msg.role === 'assistant'
                                ? <Bot size={16} aria-hidden="true" />
                                : <User size={16} aria-hidden="true" />}
                        </div>

                        {/* בועת הודעה */}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'assistant'
                                ? 'bg-white text-gray-800 rounded-tr-sm border border-gray-100'
                                : 'bg-blue-600 text-white rounded-tl-sm'
                        }`}>
                            {msg.content}
                            <div className={`text-xs mt-1 ${msg.role === 'assistant' ? 'text-gray-400' : 'text-blue-200'}`}>
                                {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {/* אנימציית "מקלידה..." */}
                {loading && (
                    <div className="flex items-start gap-3" dir="rtl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" aria-hidden="true" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-gray-100">
                            <div className="flex gap-1 items-center h-5">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </CardContent>

            {/* כפתורי פעולה מהירה */}
            <div className="px-4 py-2 border-t bg-white">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" dir="rtl">
                    {QUICK_ACTIONS.map(({ icon: Icon, label, query }) => (
                        <button
                            key={label}
                            onClick={() => sendMessage(query)}
                            disabled={loading}
                            className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                            <Icon size={12} aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* שורת הקלט */}
            <div className="px-4 pb-4 pt-2 bg-white rounded-b-xl border-t">
                <div className="flex gap-2 items-end" dir="rtl">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="שאלי את לאה... (Enter לשליחה, Shift+Enter לשורה חדשה)"
                        rows={2}
                        disabled={loading}
                        aria-label="הקלד הודעה למזכירה AI"
                        className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-right disabled:opacity-50"
                    />
                    <Button
                        onClick={() => sendMessage(input)}
                        disabled={loading || !input.trim()}
                        size="icon"
                        className="h-[52px] w-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                        aria-label="שלח הודעה"
                    >
                        <Send size={18} aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
