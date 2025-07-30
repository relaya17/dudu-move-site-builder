import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AiAnalysisService } from '@/services/AiAnalysisService';

export const AiAssistant = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');

    const handleAiQuery = async () => {
        setIsLoading(true);
        try {
            const insights = await AiAnalysisService.generateBusinessInsights();
            const pricing = await AiAnalysisService.generatePricingRecommendations();
            
            setResponse(`
                המלצות עסקיות:
                ${insights.insights}

                המלצות תמחור:
                ${pricing.recommendations}
            `);
        } catch (error) {
            console.error('שגיאה בקבלת המלצות AI:', error);
            setResponse('אירעה שגיאה בקבלת ההמלצות. אנא נסו שוב מאוחר יותר.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickQueries = [
        'איך לשפר את ההכנסות?',
        'מתי כדאי להוסיף צוות נוסף?',
        'אילו מבצעים כדאי להציע?',
        'איך לייעל את לוח הזמנים?'
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>עוזר AI חכם</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="שאל את ה-AI..."
                            className="flex-1"
                        />
                        <Button 
                            onClick={handleAiQuery}
                            disabled={isLoading}
                        >
                            {isLoading ? 'מעבד...' : 'שאל'}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {quickQueries.map((q, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => setQuery(q)}
                            >
                                {q}
                            </Button>
                        ))}
                    </div>

                    {response && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                            {response}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};