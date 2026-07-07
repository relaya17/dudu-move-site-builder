import { useEffect, useRef, useState } from 'react';

const PROMO_URL =
    'https://res.cloudinary.com/dora8sxcb/video/upload/v1783457267/seedance-2.0_English_Create_a_futuristic_high-tech_promotional_video_for_a_SaaS_platform_that-0_1_krszht.mp4';

const SEEN_KEY = 'movalo_intro_seen';
const MIN_DISPLAY_MS = 6000; // לפחות 6 שניות לפני סגירה אוטומטית

interface VideoIntroProps {
    onDone: () => void;
}

export function VideoIntro({ onDone }: VideoIntroProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [fading, setFading] = useState(false);
    const readyRef = useRef(false); // האם עברו MIN_DISPLAY_MS

    const dismiss = () => {
        if (fading) return;
        setFading(true);
        setTimeout(() => {
            sessionStorage.setItem(SEEN_KEY, '1');
            onDone();
        }, 500);
    };

    useEffect(() => {
        // נועל גלילה בזמן הפרומו — כולל איפוס מיידי לראש העמוד
        const prevOverflow = document.body.style.overflow;
        const prevPosition = document.body.style.position;
        const prevTop = document.body.style.top;
        const prevWidth = document.body.style.width;

        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.width = '100%';

        const v = videoRef.current;
        if (v) v.play().catch(() => {});

        const minTimer = setTimeout(() => { readyRef.current = true; }, MIN_DISPLAY_MS);

        const onEnded = () => {
            if (readyRef.current) {
                dismiss();
            } else {
                const remaining = MIN_DISPLAY_MS - (v ? v.currentTime * 1000 : 0);
                setTimeout(dismiss, Math.max(0, remaining));
            }
        };

        if (v) v.addEventListener('ended', onEnded);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.position = prevPosition;
            document.body.style.top = prevTop;
            document.body.style.width = prevWidth;
            window.scrollTo(0, 0);
            clearTimeout(minTimer);
            if (v) v.removeEventListener('ended', onEnded);
        };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {/* וידאו — מכסה כל המסך, תמיד מושתק */}
            <video
                ref={videoRef}
                src={PROMO_URL}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* גרדיאנט בתחתית לנראות כפתור */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

            {/* כפתור דלג */}
            <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 sm:right-8">
                <button
                    onClick={dismiss}
                    className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full backdrop-blur-sm transition font-semibold select-none"
                >
                    דלג ←
                </button>
            </div>
        </div>
    );
}

/** מחזיר true אם הסרטון כבר הוצג בסשן הנוכחי */
export function hasSeenIntro(): boolean {
    return sessionStorage.getItem(SEEN_KEY) === '1';
}
