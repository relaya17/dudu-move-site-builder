import { MoveEstimate } from '../database/models/MoveEstimate';
import OpenAI from 'openai';

interface MoveDoc {
    id: string;
    totalPrice?: number;
    preferredMoveDate?: string;
    createdAt?: Date | string;
    inventory?: Array<{ type: string; quantity: number }>;
}

function extractPrice(move: MoveDoc): number {
    return move.totalPrice ?? 0;
}

function extractDate(move: MoveDoc): Date {
    const raw = move.preferredMoveDate ?? move.createdAt;
    if (!raw) return new Date(0);
    return new Date(raw as string);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
});

export class AiAnalysisService {
    static async generateBusinessInsights() {
        try {
            // בדיקה אם יש API key
            if (!process.env.OPENAI_API_KEY) {
                return {
                    insights: `המלצות עסקיות לדוגמה:
                    
                    1. הרחבת שירותים - הוסף שירותי אריזה ואריזה מחדש
                    2. שיפור השיווק - השתמש ברשתות חברתיות להגיע ללקוחות חדשים
                    3. אופטימיזציה - נצל את שעות השפל להצעות מיוחדות`,
                    data: { totalMoves: 0, revenue: 0, popularItems: [], busyDays: {}, customerFeedback: "חיובי" }
                };
            }

            // שליפת נתוני הובלות מהחודש האחרון
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            const estimates = await MoveEstimate.find({ createdAt: { $gte: lastMonth } });
            const moves: MoveDoc[] = estimates.map(e => ({
                id: String(e._id),
                totalPrice: e.totalPrice,
                preferredMoveDate: e.preferredMoveDate,
                createdAt: e.createdAt,
                inventory: e.inventory
            }));

            // הכנת הנתונים לניתוח
            const analysisData = {
                totalMoves: moves.length,
                revenue: moves.reduce((sum, move) => sum + extractPrice(move), 0),
                popularItems: this.getPopularItems(moves),
                busyDays: this.getBusyDays(moves),
                customerFeedback: await this.getCustomerFeedback()
            };

            // שליחה ל-OpenAI לניתוח
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "אתה יועץ עסקי מומחה לחברות הובלה. נתח את הנתונים ותן המלצות עסקיות ממוקדות."
                    },
                    {
                        role: "user",
                        content: `נתוני החברה מהחודש האחרון:
                            - מספר הובלות: ${analysisData.totalMoves}
                            - הכנסות: ${analysisData.revenue}₪
                            - פריטים פופולריים: ${JSON.stringify(analysisData.popularItems)}
                            - ימים עמוסים: ${JSON.stringify(analysisData.busyDays)}
                            - משוב לקוחות: ${analysisData.customerFeedback}
                            
                            אנא תן 3 המלצות עסקיות מעשיות.`
                    }
                ],
                model: "gpt-4-turbo-preview",
            });

            return {
                insights: completion.choices[0].message.content,
                data: analysisData
            };
        } catch (error) {
            console.error('שגיאה בניתוח AI:', error);
            // Fallback response
            return {
                insights: `המלצות עסקיות לדוגמה:
                
                1. הרחבת שירותים - הוסף שירותי אריזה ואריזה מחדש
                2. שיפור השיווק - השתמש ברשתות חברתיות להגיע ללקוחות חדשים
                3. אופטימיזציה - נצל את שעות השפל להצעות מיוחדות`,
                data: { totalMoves: 0, revenue: 0, popularItems: [], busyDays: {}, customerFeedback: "חיובי" }
            };
        }
    }

    private static getPopularItems(moves: MoveDoc[]) {
        const itemCount: Record<string, number> = {};
        moves.forEach(move => {
            move.inventory?.forEach(item => {
                itemCount[item.type] = (itemCount[item.type] ?? 0) + item.quantity;
            });
        });
        return Object.entries(itemCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    }

    private static getBusyDays(moves: MoveDoc[]) {
        const dayCount: Record<string, number> = {};
        moves.forEach(move => {
            const day = extractDate(move).toLocaleDateString('he-IL', { weekday: 'long' });
            dayCount[day] = (dayCount[day] ?? 0) + 1;
        });
        return dayCount;
    }

    private static async getCustomerFeedback() {
        // כאן אפשר להוסיף אינטגרציה עם מערכת משוב לקוחות
        return "חיובי ברובו, עם דגש על מקצועיות הצוות";
    }

    static async generatePricingRecommendations() {
        try {
            // בדיקה אם יש API key
            if (!process.env.OPENAI_API_KEY) {
                return {
                    recommendations: `המלצות תמחור לדוגמה:
                    
                    1. מחירים דינמיים - התאם מחירים לפי עומס וזמן
                    2. חבילות שירות - הצע חבילות כוללות עם הנחה
                    3. מחירים תחרותיים - בדוק מחירי המתחרים ועדכן בהתאם`,
                    data: { averagePrice: 500, priceRange: { min: 300, max: 800 }, expensiveDays: [] }
                };
            }

            const moves = await this.getRecentMoves();
            const priceData = this.analyzePricing(moves);

            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "אתה מומחה לתמחור בענף ההובלות. נתח את הנתונים ותן המלצות מחיר."
                    },
                    {
                        role: "user",
                        content: `ניתוח מחירים:
                            - מחיר ממוצע להובלה: ${priceData.averagePrice}₪
                            - טווח מחירים: ${priceData.priceRange.min}₪ - ${priceData.priceRange.max}₪
                            - ימים יקרים: ${JSON.stringify(priceData.expensiveDays)}
                            
                            אנא תן המלצות לאופטימיזציית מחירים.`
                    }
                ],
                model: "gpt-4-turbo-preview",
            });

            return {
                recommendations: completion.choices[0].message.content,
                data: priceData
            };
        } catch (error) {
            console.error('שגיאה בניתוח מחירים:', error);
            // Fallback response
            return {
                recommendations: `המלצות תמחור לדוגמה:
                
                1. מחירים דינמיים - התאם מחירים לפי עומס וזמן
                2. חבילות שירות - הצע חבילות כוללות עם הנחה
                3. מחירים תחרותיים - בדוק מחירי המתחרים ועדכן בהתאם`,
                data: { averagePrice: 500, priceRange: { min: 300, max: 800 }, expensiveDays: [] }
            };
        }
    }

    private static async getRecentMoves(): Promise<MoveDoc[]> {
        const estimates = await MoveEstimate.find().sort({ createdAt: -1 }).limit(500);
        return estimates.map(e => ({
            id: String(e._id),
            totalPrice: e.totalPrice,
            preferredMoveDate: e.preferredMoveDate,
            createdAt: e.createdAt,
            inventory: e.inventory
        }));
    }

    private static analyzePricing(moves: MoveDoc[]) {
        const prices = moves.map(m => extractPrice(m)).filter(p => p > 0);
        const total = prices.reduce((a, b) => a + b, 0);
        return {
            averagePrice: prices.length > 0 ? total / prices.length : 0,
            priceRange: {
                min: prices.length > 0 ? Math.min(...prices) : 0,
                max: prices.length > 0 ? Math.max(...prices) : 0,
            },
            expensiveDays: this.getExpensiveDays(moves)
        };
    }

    private static getExpensiveDays(moves: MoveDoc[]) {
        const dayPrices: Record<string, { total: number; count: number }> = {};
        moves.forEach(move => {
            const day = extractDate(move).toLocaleDateString('he-IL', { weekday: 'long' });
            if (!dayPrices[day]) dayPrices[day] = { total: 0, count: 0 };
            dayPrices[day].total += extractPrice(move);
            dayPrices[day].count++;
        });

        return Object.entries(dayPrices)
            .map(([day, data]) => ({
                day,
                averagePrice: data.total / data.count
            }))
            .sort((a, b) => b.averagePrice - a.averagePrice);
    }
}