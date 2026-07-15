/**
 * אומדן מחיר שקוף לשוק ההובלות בישראל —
 * טווח ₪, פירוק גורמים, ורמת ביטחון כנה (לא "AI מדומה").
 */

import { Sparkles } from 'lucide-react';

export interface PriceFactor {
    id: string;
    label: string;
    amount: number;
    kind: 'base' | 'add' | 'discount';
}

export interface DetailedPriceEstimate {
    currency: 'ILS';
    estimatedTotal: number;
    minEstimate: number;
    maxEstimate: number;
    factors: PriceFactor[];
    confidence: number;
    confidenceLabel: string;
    notes: string[];
    algorithmVersion?: string;
    vatNote?: string;
}

function formatIls(n: number): string {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0,
    }).format(n);
}

export function PriceEstimateBreakdown({
    estimate,
    compact = false,
}: {
    estimate: DetailedPriceEstimate;
    compact?: boolean;
}) {
    const confidenceColor =
        estimate.confidence >= 80
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : estimate.confidence >= 65
                ? 'bg-sky-100 text-sky-800 border-sky-200'
                : 'bg-amber-100 text-amber-900 border-amber-200';

    return (
        <div
            dir="rtl"
            className={`rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-sm ${compact ? 'p-4' : 'p-5'}`}
            role="region"
            aria-label="אומדן מחיר הובלה"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
                        <Sparkles className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                        <h3 className={`font-semibold text-sky-950 ${compact ? 'text-sm' : 'text-base'}`}>
                            אומדן מחיר חכם
                        </h3>
                        <p className="text-xs text-sky-700/80">מנוע תמחור ישראלי · שקלים · שקוף</p>
                    </div>
                </div>
                <span className={`shrink-0 text-[11px] font-medium border rounded-full px-2.5 py-1 ${confidenceColor}`}>
                    ביטחון {estimate.confidence}% · {estimate.confidenceLabel}
                </span>
            </div>

            <p className={`font-bold text-sky-950 text-center ${compact ? 'text-xl mb-3' : 'text-2xl mb-4'}`}>
                {formatIls(estimate.minEstimate)} – {formatIls(estimate.maxEstimate)}
            </p>

            {!compact && estimate.factors.length > 0 && (
                <ul className="space-y-1.5 mb-4 border-t border-sky-100 pt-3">
                    {estimate.factors.map(f => (
                        <li key={f.id} className="flex items-center justify-between text-sm gap-3">
                            <span className="text-gray-700">{f.label}</span>
                            <span
                                className={`font-medium tabular-nums ${
                                    f.kind === 'discount' ? 'text-emerald-700' : 'text-gray-900'
                                }`}
                                dir="ltr"
                            >
                                {f.amount >= 0 ? '+' : ''}
                                {formatIls(f.amount)}
                            </span>
                        </li>
                    ))}
                    <li className="flex items-center justify-between text-sm font-semibold border-t border-sky-100 pt-2 mt-1">
                        <span>סה״כ משוער</span>
                        <span className="tabular-nums" dir="ltr">{formatIls(estimate.estimatedTotal)}</span>
                    </li>
                </ul>
            )}

            <ul className="space-y-1">
                {estimate.notes.slice(0, compact ? 2 : 4).map((note, i) => (
                    <li key={i} className="text-xs text-sky-800/90 leading-relaxed">
                        • {note}
                    </li>
                ))}
            </ul>
            {estimate.vatNote && !compact && (
                <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">{estimate.vatNote}</p>
            )}
        </div>
    );
}
