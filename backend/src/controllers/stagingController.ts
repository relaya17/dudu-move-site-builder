/**
 * Virtual Staging — עיצוב חדר ריק בתמונה (AI).
 * עם OPENAI_API_KEY: ניסיון לייצר תיאור/הנחיה; ללא מפתח — מצב הדגמה יציב.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

const schema = z.object({
    style: z.enum(['modern', 'scandinavian', 'industrial', 'mediterranean', 'minimal']).default('modern'),
    roomType: z.enum(['living', 'bedroom', 'kitchen', 'office', 'empty']).default('living'),
    notes: z.string().max(500).optional(),
    /** data URL או URL ציבורי — אופציונלי במצב הדגמה */
    imageDataUrl: z.string().max(8_000_000).optional(),
});

const STYLE_LABELS: Record<string, string> = {
    modern: 'מודרני ישראלי',
    scandinavian: 'סקנדינבי בהיר',
    industrial: 'תעשייתי חם',
    mediterranean: 'ים-תיכוני',
    minimal: 'מינימליסטי',
};

const ROOM_LABELS: Record<string, string> = {
    living: 'סלון',
    bedroom: 'חדר שינה',
    kitchen: 'מטבח',
    office: 'משרד ביתי',
    empty: 'חלל ריק',
};

export async function generateVirtualStaging(req: Request, res: Response): Promise<void> {
    try {
        const parsed = schema.parse(req.body);
        const styleHe = STYLE_LABELS[parsed.style];
        const roomHe = ROOM_LABELS[parsed.roomType];

        const prompt =
            `Virtual staging for an Israeli ${parsed.roomType} room in ${parsed.style} style. ` +
            `Bright natural light, realistic furniture suitable for a moving company preview. ` +
            (parsed.notes ? `Notes: ${parsed.notes}` : '');

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-dummy')) {
            res.status(200).json({
                success: true,
                data: {
                    mode: 'demo',
                    style: parsed.style,
                    roomType: parsed.roomType,
                    title: `עיצוב מדומה · ${roomHe} · ${styleHe}`,
                    description:
                        'מצב הדגמה: כך ייראה חלל ריק אחרי Virtual Staging. ' +
                        'עם מפתח OpenAI אמיתי המערכת תייצר הנחיית עיצוב מותאמת (ובהמשך תמונה).',
                    promptHe: `חלל ${roomHe} בסגנון ${styleHe}${parsed.notes ? ` — ${parsed.notes}` : ''}`,
                    promptEn: prompt,
                    previewGradient: styleToGradient(parsed.style),
                },
            });
            return;
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'אתה מעצב פנים לישראל. תן תיאור קצר בעברית (עד 120 מילים) ל-virtual staging של חדר, כולל ריהוט מומלץ.',
                },
                { role: 'user', content: `חדר: ${roomHe}. סגנון: ${styleHe}. ${parsed.notes || ''}` },
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        res.status(200).json({
            success: true,
            data: {
                mode: 'ai',
                style: parsed.style,
                roomType: parsed.roomType,
                title: `עיצוב AI · ${roomHe} · ${styleHe}`,
                description: completion.choices[0]?.message?.content || 'לא התקבל תיאור',
                promptEn: prompt,
                previewGradient: styleToGradient(parsed.style),
                hasSourceImage: !!parsed.imageDataUrl,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: 'נתונים לא תקינים' });
            return;
        }
        console.error('generateVirtualStaging:', error);
        res.status(500).json({ success: false, message: 'שגיאה ביצירת העיצוב' });
    }
}

function styleToGradient(style: string): string {
    switch (style) {
        case 'scandinavian': return 'from-slate-100 via-sky-50 to-amber-50';
        case 'industrial': return 'from-stone-700 via-neutral-600 to-amber-800';
        case 'mediterranean': return 'from-sky-200 via-teal-100 to-amber-100';
        case 'minimal': return 'from-zinc-50 via-white to-zinc-100';
        default: return 'from-blue-100 via-indigo-50 to-violet-100';
    }
}
