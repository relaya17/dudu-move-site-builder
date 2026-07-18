export const accessibilityConfig = {
    // הגדרות ברירת מחדל
    defaults: {
        fontSize: 16,
        lineHeight: 1.5,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        colorScheme: 'light',
    },

    // רמות ניגודיות
    contrast: {
        normal: {
            background: '#ffffff',
            text: '#000000',
            primary: '#1a73e8',
        },
        high: {
            background: '#000000',
            text: '#ffffff',
            primary: '#ffeb3b',
        },
    },

    // הגדרות אנימציה
    animation: {
        reducedMotion: {
            enabled: false,
            duration: '0.01ms',
        },
    },

    // תוויות נגישות
    labels: {
        skipToContent: 'דלג לתוכן העיקרי',
        menuButton: 'תפריט ראשי',
        closeButton: 'סגור',
        searchInput: 'חיפוש',
        required: 'שדה חובה',
        error: 'שגיאה',
        success: 'פעולה הושלמה בהצלחה',
    },

    // הודעות קוליות
    announcements: {
        loading: 'טוען תוכן, אנא המתן',
        updated: 'התוכן עודכן',
        error: 'אירעה שגיאה, אנא נסה שוב',
    },

    // תמיכה במקלדת
    keyboard: {
        focusOutlineWidth: '3px',
        focusOutlineColor: '#1a73e8',
        focusOutlineStyle: 'solid',
    },

    // הגדרות ARIA
    aria: {
        landmarks: {
            main: 'תוכן ראשי',
            navigation: 'ניווט ראשי',
            search: 'חיפוש',
            banner: 'כותרת',
            contentinfo: 'מידע נוסף',
        },
        roles: {
            button: 'כפתור',
            link: 'קישור',
            dialog: 'חלון דו-שיח',
            alert: 'התראה',
        },
    }
};