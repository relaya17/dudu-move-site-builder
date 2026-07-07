import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquarePlus, X, ImagePlus, Loader2 } from 'lucide-react';

const API_BASE = '/api';
const CLOUDINARY_CLOUD = 'dora8sxcb';
const CLOUDINARY_PRESET = 'ml_default';

interface Review {
    _id: string;
    customerName: string;
    text: string;
    rating: number;
    photoUrl?: string;
    reply?: string;
    repliedAt?: string;
    createdAt: string;
}

const FALLBACK: Review[] = [
    { _id: '1', customerName: 'שרה כהן', rating: 5, text: 'דוד הובלות הפכו את המעבר שלנו לחלק לחלוטין. הצוות היה מקצועי, זהיר עם החפצים שלנו, והעביר הכל בזמן. ממליצה בחום!', createdAt: '' },
    { _id: '2', customerName: 'מיכאל לוי', rating: 5, text: 'שירות מעולה מתחילה ועד סוף! הם טיפלו בהעברת המשרד שלנו עם הפרעה מינימלית לעסק. התמחור היה הוגן ושקוף.', createdAt: '' },
    { _id: '3', customerName: 'רותי אברהם', rating: 5, text: 'הייתי מלחיצה לגבי המעבר עם שני ילדים קטנים, אבל הצוות עשה את זה כל כך קל. הם היו סבלניים, יעילים וזהירים עם הרהיטים.', createdAt: '' },
    { _id: '4', customerName: 'דוד ישראלי', rating: 5, text: 'החוויה הטובה ביותר של הובלה שחוויתי! הצוות הגיע בזמן, עבד מהר, ושום דבר לא נפגע. שווה כל שקל.', createdAt: '' },
    { _id: '5', customerName: 'לירון בן דוד', rating: 5, text: 'מקצועיים, אדיבים ויעילים. הם אפילו עזרו עם אריזה בדקה האחרונה. בהחלט אשתמש בהם שוב.', createdAt: '' },
    { _id: '6', customerName: 'רונן גרוס', rating: 5, text: 'שירות יוצא מן הכלל! טיפלו ברהיטים העתיקים שלנו בזהירות יתרה וסיפקו שירות לקוחות מעולה לאורך כל התהליך.', createdAt: '' },
];

function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-0.5" role={interactive ? 'group' : 'img'} aria-label={`דירוג ${rating} מתוך 5`}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    className={`h-5 w-5 transition-colors ${i <= (interactive ? hover || rating : rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${interactive ? 'cursor-pointer' : ''}`}
                    onClick={() => interactive && onChange?.(i)}
                    onMouseEnter={() => interactive && setHover(i)}
                    onMouseLeave={() => interactive && setHover(0)}
                    aria-hidden="true"
                />
            ))}
        </div>
    );
}

export const Testimonials = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [rating, setRating] = useState(5);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch(`${API_BASE}/reviews`)
            .then(r => r.json())
            .then(data => setReviews(data.success && data.data.length ? data.data : FALLBACK))
            .catch(() => setReviews(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const uploadPhoto = async (file: File): Promise<string | undefined> => {
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', CLOUDINARY_PRESET);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: fd });
            const data = await res.json();
            return data.secure_url as string;
        } catch {
            return undefined;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;
        setSubmitting(true);

        let photoUrl: string | undefined;
        if (photoFile) photoUrl = await uploadPhoto(photoFile);

        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName: name.trim(), text: text.trim(), rating, photoUrl }),
        });
        const data = await res.json();

        if (data.success) {
            setReviews(prev => [data.data, ...prev.filter(r => r._id.length > 5)]);
            setSuccess(true);
            setTimeout(() => { setShowForm(false); setSuccess(false); setName(''); setText(''); setRating(5); setPhotoFile(null); setPhotoPreview(''); }, 2000);
        }
        setSubmitting(false);
    };

    const displayed = loading ? FALLBACK : reviews;

    return (
        <section id="testimonials" className="py-20 bg-white" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        מה הלקוחות שלנו אומרים
                        <span className="inline-block animate-pulse text-blue-600 mr-2 text-4xl">؟</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                        אל תסתמכו רק על המילה שלנו - שמעו מלקוחות מרוצים
                    </p>
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <MessageSquarePlus className="h-4 w-4" />
                        כתוב ביקורת
                    </Button>
                </div>

                {/* כרטיסיות ביקורות */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayed.map((r) => (
                        <Card key={r._id} className="h-full hover:shadow-lg transition-shadow duration-300 animate-fadeInUp">
                            <CardContent className="p-6 flex flex-col gap-3">
                                {r.photoUrl && (
                                    <img src={r.photoUrl} alt="תמונת לקוח" className="w-full h-40 object-cover rounded-lg" />
                                )}
                                <Stars rating={r.rating} />
                                <p className="text-gray-600 leading-relaxed flex-1">"{r.text}"</p>
                                <div className="border-t pt-3">
                                    <p className="font-semibold text-gray-900">{r.customerName}</p>
                                    {r.createdAt && (
                                        <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('he-IL')}</p>
                                    )}
                                </div>
                                {/* תגובת העסק */}
                                {r.reply && (
                                    <div className="bg-blue-50 border-r-4 border-blue-400 pr-3 py-2 rounded text-sm text-blue-900 mt-1">
                                        <p className="font-semibold text-blue-700 mb-1">💬 תגובת הצוות:</p>
                                        <p>{r.reply}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* דירוג כולל */}
                <div className="text-center mt-12 px-4">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-blue-50 px-6 py-4 rounded-xl w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" aria-hidden="true" />
                            ))}
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xl font-bold text-gray-900">4.9/5 כוכבים</p>
                            <p className="text-sm text-gray-600">מבוסס על {reviews.length > 6 ? `${reviews.length}+` : '500+'} ביקורות</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* מודל כתיבת ביקורת */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative" dir="rtl">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-5">✍️ כתוב ביקורת</h3>

                        {success ? (
                            <div className="text-center py-8">
                                <p className="text-4xl mb-3">🎉</p>
                                <p className="text-green-600 font-semibold text-lg">תודה על הביקורת!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">שמך *</label>
                                    <input value={name} onChange={e => setName(e.target.value)} required maxLength={80}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ישראל ישראלי" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">דירוג *</label>
                                    <Stars rating={rating} interactive onChange={setRating} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">הביקורת שלך *</label>
                                    <textarea value={text} onChange={e => setText(e.target.value)} required maxLength={1000} rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="ספר על החוויה שלך..." />
                                </div>

                                {/* העלאת תמונה */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">תמונה (אופציונלי)</label>
                                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                                    <button type="button" onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition w-full justify-center">
                                        <ImagePlus className="h-4 w-4" />
                                        {photoFile ? photoFile.name : 'לחץ להעלאת תמונה'}
                                    </button>
                                    {photoPreview && (
                                        <img src={photoPreview} alt="תצוגה מקדימה" className="mt-2 w-full h-32 object-cover rounded-lg" />
                                    )}
                                </div>

                                <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-1">
                                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />שולח...</> : 'שלח ביקורת'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};
