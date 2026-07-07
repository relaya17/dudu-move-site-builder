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
    const [muted, setMuted] = useState(true);

    const dismiss = () => {
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
        const onEnded = () => dismiss();
        v.addEventListener('ended', onEnded);
        return () => v.removeEventListener('ended', onEnded);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
            <video
                ref={videoRef}
                src={PROMO_URL}
                muted={muted}
                playsInline
                className="w-full h-full object-cover"
            />

            {/* פקדים */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-6">
                {/* השתק / הפעל */}
                <button
                    onClick={() => {
                        setMuted(m => !m);
                        if (videoRef.current) videoRef.current.muted = !muted;
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm transition"
                    aria-label={muted ? 'הפעל שמע' : 'השתק'}
                >
                    {muted ? '🔇 הפעל שמע' : '🔊 השתק'}
                </button>

                {/* דלג */}
                <button
                    onClick={dismiss}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm px-5 py-2 rounded-full backdrop-blur-sm transition font-medium"
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
