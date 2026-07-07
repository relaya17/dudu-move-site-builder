import { useEffect, useRef, useState } from 'react';

const PROMO_URL =
    'https://res.cloudinary.com/dora8sxcb/video/upload/v1783457267/seedance-2.0_English_Create_a_futuristic_high-tech_promotional_video_for_a_SaaS_platform_that-0_1_krszht.mp4';

const SEEN_KEY = 'movalo_intro_seen';

interface VideoIntroProps {
    onDone: () => void;
}

export function VideoIntro({ onDone }: VideoIntroProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [fading, setFading] = useState(false);

    const dismiss = () => {
        if (fading) return;
        setFading(true);
        setTimeout(() => {
            sessionStorage.setItem(SEEN_KEY, '1');
            onDone();
        }, 500);
    };

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.play().catch(() => {});
        v.addEventListener('ended', dismiss);
        return () => v.removeEventListener('ended', dismiss);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {/* וידאו — מכסה את כל המסך בכל גודל, תמיד מושתק */}
            <video
                ref={videoRef}
                src={PROMO_URL}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* שכבת עמעום קלה בתחתית לנראות כפתור */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

            {/* כפתור דלג בלבד — safe-area aware */}
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
