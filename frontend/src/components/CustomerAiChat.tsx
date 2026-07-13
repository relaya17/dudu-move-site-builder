/**
 * Customer AI Chat - צ'אט AI ללקוחות בדף המעקב
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, MessageCircle, X } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface CustomerAiChatProps {
    trackingToken: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

export function CustomerAiChat({ trackingToken }: CustomerAiChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch suggestions
        fetch(`${API_BASE_URL}/api/public/ai/suggestions/${trackingToken}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) setSuggestions(data.data);
            })
            .catch(() => {});
    }, [trackingToken]);

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
            const response = await fetch(`${API_BASE_URL}/api/public/ai/chat/${trackingToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.data.message
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message || 'מצטער, אירעה שגיאה. נסה שוב.'
                }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'שגיאת תקשורת. לשאלות התקשר 054-7777623.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    // Minimized button
    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
                aria-label="פתח צ'אט"
            >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">יש שאלה?</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: '400px', maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <div>
                        <h3 className="font-semibold text-sm">עוזר וירטואלי</h3>
                        <p className="text-xs text-blue-100">שאל אותי על ההובלה</p>
                    </div>
                </div>
                <button 
                    onClick={() => setExpanded(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" dir="rtl">
                {messages.length === 0 && (
                    <div className="text-center py-4">
                        <Bot className="h-10 w-10 mx-auto text-blue-500 mb-2" />
                        <p className="text-gray-600 text-sm mb-3">איך אני יכול לעזור?</p>
                        
                        {/* Suggestions */}
                        <div className="space-y-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(s)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition text-right"
                                >
                                    {s}
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
                            className={`max-w-[85%] rounded-xl px-3 py-2 ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-end">
                        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
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
                        placeholder="כתוב שאלה..."
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                        maxLength={500}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
