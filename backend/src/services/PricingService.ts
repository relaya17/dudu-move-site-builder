interface PricingConfig {
    basePrice: number;
    pricePerItem: number;
    fragileMultiplier: number;
    disassemblePrice: number;
    reassemblePrice: number;
    floorPrice: number;
    distancePrice: number;
    elevatorDiscount: number;
    cranePrice: number;
    doorRemovalPrice: number;
}

interface FurnitureItem {
    type: string;
    quantity: number;
    description?: string;
    /** הסרת דלתות בלבד (ללא פירוק מלא) - חלופה זולה יותר לפירוק, בעיקר לארונות. */
    needsDoorRemoval?: boolean;
}

interface FurniturePricing {
    [key: string]: {
        basePrice: number;
        fragile: boolean;
        needsDisassemble: boolean;
        maxQuantity: number;
        description: string;
        category: string;
    };
}

/** גורם תמחור שקוף ללקוח/סוכן — סכומים ב־₪. */
export interface PriceFactor {
    id: string;
    label: string;
    amount: number;
    kind: 'base' | 'add' | 'discount';
}

/** תוצאת אומדן מפורט לשוק ההובלות בישראל. */
export interface DetailedPriceEstimate {
    currency: 'ILS';
    estimatedTotal: number;
    minEstimate: number;
    maxEstimate: number;
    factors: PriceFactor[];
    confidence: number;
    confidenceLabel: string;
    notes: string[];
    algorithmVersion: string;
    vatNote: string;
}

// קטגוריות תצוגה (תת-קטגוריות) לרשימת הפריטים בטופס - לשימוש ב-optgroup בצד ה-frontend.
export const FURNITURE_CATEGORIES = {
    seating: 'ישיבה',
    bedroom: 'חדר שינה',
    storage: 'ארונות ואחסון',
    tables: 'שולחנות ופינות אוכל',
    large_appliances: 'מכשירי חשמל גדולים',
    small_appliances: 'מכשירי חשמל קטנים',
    packing: 'אריזה (קרטונים ושקיות)',
    decor: 'אביזרים ופריטי נוי',
    garden: 'ריהוט גינה וחוץ',
    baby: 'תינוקות וילדים',
    special: 'פריטים מיוחדים',
    other: 'אחר'
} as const;

export class PricingService {
    private static readonly PRICING_CONFIG: PricingConfig = {
        basePrice: 500, // מחיר בסיס להובלה
        pricePerItem: 50, // מחיר לכל פריט נוסף
        fragileMultiplier: 1.5, // מכפיל לפריטים שבירים
        disassemblePrice: 200, // מחיר לפירוק בסיסי
        reassemblePrice: 150, // מחיר להרכבה בסיסית
        floorPrice: 50, // מחיר לכל קומה
        distancePrice: 2, // מחיר לכל ק"מ
        elevatorDiscount: 0.8, // הנחה במעלית (20%)
        cranePrice: 500, // מחיר להובלה בכרן
        doorRemovalPrice: 150, // הסרת דלתות בלבד (חלופה זולה יותר לפירוק מלא)
    };

    private static readonly FURNITURE_PRICING: FurniturePricing = {
        // ישיבה
        sofa: {
            basePrice: 300,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'ספה',
            category: FURNITURE_CATEGORIES.seating
        },
        chair: {
            basePrice: 50,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'כיסא',
            category: FURNITURE_CATEGORIES.seating
        },
        armchair: {
            basePrice: 120,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 4,
            description: 'כורסה',
            category: FURNITURE_CATEGORIES.seating
        },

        // חדר שינה
        bed_single: {
            basePrice: 250,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטת יחיד',
            category: FURNITURE_CATEGORIES.bedroom
        },
        bed_double: {
            basePrice: 450,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטה זוגית',
            category: FURNITURE_CATEGORIES.bedroom
        },
        bed: {
            basePrice: 350,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטה',
            category: FURNITURE_CATEGORIES.bedroom
        },
        bed_with_storage: {
            basePrice: 400, // מיטה עם ארגז מצעים - מנגנון הרמה נוסף מייקר את הפירוק/הרכבה
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטה עם ארגז מצעים',
            category: FURNITURE_CATEGORIES.bedroom
        },
        kids_bed: {
            basePrice: 220,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטת ילד',
            category: FURNITURE_CATEGORIES.bedroom
        },
        mattress: {
            basePrice: 80,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'מזרן',
            category: FURNITURE_CATEGORIES.bedroom
        },
        nightstand: {
            basePrice: 60,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 4,
            description: 'שידת לילה',
            category: FURNITURE_CATEGORIES.bedroom
        },
        dresser: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'קומודה',
            category: FURNITURE_CATEGORIES.bedroom
        },

        // שולחנות ופינות אוכל
        table: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 4,
            description: 'שולחן',
            category: FURNITURE_CATEGORIES.tables
        },
        desk: {
            basePrice: 180,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'שולחן עבודה',
            category: FURNITURE_CATEGORIES.tables
        },
        dining_table: {
            basePrice: 200,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'שולחן אוכל',
            category: FURNITURE_CATEGORIES.tables
        },
        dining_corner_small: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'פינת אוכל קטנה',
            category: FURNITURE_CATEGORIES.tables
        },
        dining_corner_medium: {
            basePrice: 500,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'פינת אוכל בינונית',
            category: FURNITURE_CATEGORIES.tables
        },
        dining_corner_large: {
            basePrice: 700,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 1,
            description: 'פינת אוכל גדולה',
            category: FURNITURE_CATEGORIES.tables
        },

        // מכשירי חשמל גדולים
        tv: {
            basePrice: 120,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'טלוויזיה',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        refrigerator: {
            basePrice: 400,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מקרר',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        washing_machine: {
            basePrice: 200,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מכונת כביסה',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        dishwasher: {
            basePrice: 180,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מדיח כלים',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        air_conditioner: {
            basePrice: 150,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'מזגן',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        dryer: {
            basePrice: 200,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מייבש כביסה',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        oven: {
            basePrice: 180,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'תנור אפייה',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        gas_stove: {
            basePrice: 150,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'כיריים גז / חשמל',
            category: FURNITURE_CATEGORIES.large_appliances
        },
        gas_balloon: {
            // בלון גז - יש לוודא עם הצוות שהבלון מנותק וסגור לפני ההובלה (מטעמי בטיחות).
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 4,
            description: 'בלון גז (מנותק וסגור)',
            category: FURNITURE_CATEGORIES.large_appliances
        },

        // ארונות ואחסון
        cabinet: {
            basePrice: 120,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 5,
            description: 'ארון',
            category: FURNITURE_CATEGORIES.storage
        },
        cabinet_small: {
            basePrice: 100,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 5,
            description: 'ארון קטן',
            category: FURNITURE_CATEGORIES.storage
        },
        cabinet_large: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'ארון גדול',
            category: FURNITURE_CATEGORIES.storage
        },
        bookshelf: {
            basePrice: 100,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מדף ספרים',
            category: FURNITURE_CATEGORIES.storage
        },
        shelf: {
            basePrice: 30,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'מדף קיר בודד',
            category: FURNITURE_CATEGORIES.storage
        },
        shelving_unit: {
            basePrice: 120,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מדפייה / כונניות אחסון',
            category: FURNITURE_CATEGORIES.storage
        },
        drawer: {
            basePrice: 80,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 4,
            description: 'מגירה',
            category: FURNITURE_CATEGORIES.storage
        },
        wardrobe: {
            basePrice: 300, // הובלת הארון עצמו
            fragile: false,
            needsDisassemble: true, // פירוק+הרכבה: 450 ₪ (ר' getDisassembleFees)
            maxQuantity: 2,
            description: 'ארון בגדים',
            category: FURNITURE_CATEGORIES.storage
        },
        wardrobe_3_door: {
            basePrice: 350,
            fragile: false,
            needsDisassemble: true, // פירוק+הרכבה: 500 ₪
            maxQuantity: 2,
            description: 'ארון 3 דלתות',
            category: FURNITURE_CATEGORIES.storage
        },
        wardrobe_4_door: {
            basePrice: 450,
            fragile: false,
            needsDisassemble: true, // פירוק+הרכבה: 600 ₪
            maxQuantity: 2,
            description: 'ארון 4 דלתות',
            category: FURNITURE_CATEGORIES.storage
        },
        wardrobe_sliding: {
            basePrice: 400,
            fragile: false,
            needsDisassemble: true, // פירוק+הרכבה: 550 ₪
            maxQuantity: 2,
            description: 'ארון הזזה',
            category: FURNITURE_CATEGORIES.storage
        },
        built_in_closet: {
            // ארון קיר / בילט-אין מודולרי - עבודת פירוק/הרכבה מורכבת ומשמעותית יותר
            // מארון חדר שינה רגיל (התאמה מדויקת לקיר, לעתים כוללת חיתוך/כיוונון בהרכבה).
            basePrice: 450,
            fragile: false,
            needsDisassemble: true, // פירוק+הרכבה: 700 ₪ (ר' getDisassembleFees)
            maxQuantity: 2,
            description: 'ארון קיר / בילט-אין',
            category: FURNITURE_CATEGORIES.storage
        },
        buffet: {
            basePrice: 250,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'מזנון / ויטרינת מטבח',
            category: FURNITURE_CATEGORIES.storage
        },
        shoe_cabinet: {
            basePrice: 90,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'ארונית נעליים',
            category: FURNITURE_CATEGORIES.storage
        },
        tv_unit: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'מזנון טלוויזיה',
            category: FURNITURE_CATEGORIES.storage
        },

        // מכשירי חשמל קטנים
        microwave: {
            basePrice: 60,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מיקרוגל',
            category: FURNITURE_CATEGORIES.small_appliances
        },
        toaster: {
            basePrice: 30,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'טוסטר',
            category: FURNITURE_CATEGORIES.small_appliances
        },
        coffee_machine: {
            basePrice: 50,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מכונת קפה',
            category: FURNITURE_CATEGORIES.small_appliances
        },
        computer: {
            basePrice: 80,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'מחשב',
            category: FURNITURE_CATEGORIES.small_appliances
        },
        blender: {
            basePrice: 30,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'בלנדר / מיקסר',
            category: FURNITURE_CATEGORIES.small_appliances
        },
        vacuum_cleaner: {
            basePrice: 50,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'שואב אבק',
            category: FURNITURE_CATEGORIES.small_appliances
        },
        iron_board: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מגהץ ושולחן גיהוץ',
            category: FURNITURE_CATEGORIES.small_appliances
        },

        // אריזה (קרטונים ושקיות) - מחירים מותאמים למחירי השוק הנוכחיים
        box: {
            basePrice: 30,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 30,
            description: 'קרטון (בינוני)',
            category: FURNITURE_CATEGORIES.packing
        },
        box_small: {
            basePrice: 20,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 30,
            description: 'קרטון קטן',
            category: FURNITURE_CATEGORIES.packing
        },
        box_large: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 30,
            description: 'קרטון גדול',
            category: FURNITURE_CATEGORIES.packing
        },
        bag: {
            basePrice: 20,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 20,
            description: 'שקית',
            category: FURNITURE_CATEGORIES.packing
        },

        // אביזרים ופריטי נוי
        mirror: {
            basePrice: 40,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'מראה',
            category: FURNITURE_CATEGORIES.decor
        },
        lamp: {
            basePrice: 30,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'מנורה',
            category: FURNITURE_CATEGORIES.decor
        },
        rug: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'שטיח',
            category: FURNITURE_CATEGORIES.decor
        },
        curtain: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'וילון',
            category: FURNITURE_CATEGORIES.decor
        },
        toilette_table: {
            basePrice: 80,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'שולחן טואלט',
            category: FURNITURE_CATEGORIES.decor
        },
        picture: {
            basePrice: 20,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'תמונה',
            category: FURNITURE_CATEGORIES.decor
        },
        large_plants: {
            basePrice: 70,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'עצים ועציצים גדולים',
            category: FURNITURE_CATEGORIES.decor
        },
        wall_clock: {
            basePrice: 25,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'שעון קיר',
            category: FURNITURE_CATEGORIES.decor
        },
        laundry_basket: {
            basePrice: 25,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'סל כביסה',
            category: FURNITURE_CATEGORIES.decor
        },

        // פריטים מיוחדים
        piano: {
            basePrice: 800,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'פסנתר',
            category: FURNITURE_CATEGORIES.special
        },
        safe: {
            basePrice: 400,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'כספת',
            category: FURNITURE_CATEGORIES.special
        },
        bicycle: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'אופניים',
            category: FURNITURE_CATEGORIES.special
        },
        treadmill: {
            basePrice: 200,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'מכשיר כושר / הליכון',
            category: FURNITURE_CATEGORIES.special
        },
        aquarium: {
            basePrice: 150,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'אקווריום',
            category: FURNITURE_CATEGORIES.special
        },
        toolbox: {
            basePrice: 60,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'ארגז כלי עבודה',
            category: FURNITURE_CATEGORIES.special
        },

        // ריהוט גינה וחוץ
        garden_table: {
            basePrice: 120,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'שולחן גינה',
            category: FURNITURE_CATEGORIES.garden
        },
        garden_chair: {
            basePrice: 30,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 12,
            description: 'כיסא גינה',
            category: FURNITURE_CATEGORIES.garden
        },
        garden_umbrella: {
            basePrice: 100,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'שמשיה / גגון',
            category: FURNITURE_CATEGORIES.garden
        },
        bbq_grill: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'מנגל / ברביקיו',
            category: FURNITURE_CATEGORIES.garden
        },
        lawn_mower: {
            basePrice: 180,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מכסחת דשא',
            category: FURNITURE_CATEGORIES.garden
        },
        garden_storage: {
            basePrice: 250,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 1,
            description: 'ארגז / מחסן גינה',
            category: FURNITURE_CATEGORIES.garden
        },
        garden_bench: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'ספסל / ספת גינה',
            category: FURNITURE_CATEGORIES.garden
        },

        // תינוקות וילדים
        baby_crib: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'מיטת תינוק / עריסה',
            category: FURNITURE_CATEGORIES.baby
        },
        stroller: {
            basePrice: 60,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'עגלת תינוק',
            category: FURNITURE_CATEGORIES.baby
        },
        baby_swing: {
            basePrice: 50,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'נדנדת תינוק',
            category: FURNITURE_CATEGORIES.baby
        },
        high_chair: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'כיסא אוכל לתינוק',
            category: FURNITURE_CATEGORIES.baby
        },

        // אחר - פריט שלא ברשימה: יש לתאר אותו בשדה "הערות" (למשל פסנתר ישן,
        // כספת לא סטנדרטית וכו') כדי שהמחיר הסופי יאושר טלפונית בהתאם.
        other: {
            basePrice: 50,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'אחר (תאר/י בהערות)',
            category: FURNITURE_CATEGORIES.other
        }
    };

    /**
     * חישוב מחיר כולל להובלה
     */
    static calculateTotalPrice(
        apartmentType: string,
        furnitureItems: FurnitureItem[],
        floorDifference: number,
        hasElevator: boolean,
        originHasCrane: boolean = false,
        destinationHasCrane: boolean = false
    ): number {
        return this.calculateDetailedEstimate({
            apartmentType,
            furnitureItems,
            floorDifference,
            hasElevator,
            originHasCrane,
            destinationHasCrane,
        }).estimatedTotal;
    }

    /**
     * ממיר מספר חדרים / תיאור דירה למפתח תמחור ישראלי (1.5 … 5+).
     */
    static resolveApartmentTypeKey(input?: string | number | null): string {
        if (input === undefined || input === null || input === '') return '';
        if (typeof input === 'number' && Number.isFinite(input)) {
            if (input <= 1.5) return '1.5';
            if (input <= 2) return '2';
            if (input <= 2.5) return '2.5';
            if (input <= 3) return '3';
            if (input <= 3.5) return '3.5';
            if (input <= 4) return '4';
            if (input <= 4.5) return '4.5';
            return '5+';
        }
        const raw = String(input).trim();
        if (['1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'].includes(raw)) return raw;
        const roomsMatch = raw.match(/(\d+(?:\.\d+)?)/);
        if (roomsMatch) return this.resolveApartmentTypeKey(Number(roomsMatch[1]));
        return '';
    }

    /**
     * הערכת מחיר מפורטת לישראל: פירוק גורמים, טווח, ורמת ביטחון כנה
     * (לפי שלמות הנתונים — לא "AI מדומה").
     */
    static calculateDetailedEstimate(input: {
        apartmentType?: string | number | null;
        rooms?: number | null;
        furnitureItems: FurnitureItem[];
        floorDifference: number;
        hasElevator: boolean;
        originHasCrane?: boolean;
        destinationHasCrane?: boolean;
        hasAddresses?: boolean;
        moveDateKnown?: boolean;
    }): DetailedPriceEstimate {
        const apartmentKey = this.resolveApartmentTypeKey(input.apartmentType)
            || this.resolveApartmentTypeKey(input.rooms);
        const furnitureItems = input.furnitureItems || [];
        const floorDifference = Math.max(0, input.floorDifference || 0);
        const hasElevator = !!input.hasElevator;
        const originHasCrane = !!input.originHasCrane;
        const destinationHasCrane = !!input.destinationHasCrane;

        const basePrice = this.PRICING_CONFIG.basePrice;
        const apartmentPrice = apartmentKey ? this.calculateApartmentTypePrice(apartmentKey) : 0;
        const furniturePrice = this.calculateFurniturePrice(furnitureItems);
        const floorPriceRaw = floorDifference * this.PRICING_CONFIG.floorPrice;
        const floorPrice = hasElevator ? floorPriceRaw * this.PRICING_CONFIG.elevatorDiscount : floorPriceRaw;
        const elevatorSavings = hasElevator ? Math.round(floorPriceRaw - floorPrice) : 0;

        let cranePrice = 0;
        if (originHasCrane) cranePrice += this.PRICING_CONFIG.cranePrice;
        if (destinationHasCrane) cranePrice += this.PRICING_CONFIG.cranePrice;

        const estimatedTotal = Math.round(
            basePrice + apartmentPrice + furniturePrice + floorPrice + cranePrice
        );

        const factors: PriceFactor[] = [
            { id: 'base', label: 'בסיס הובלה', amount: basePrice, kind: 'base' },
        ];
        if (apartmentPrice > 0) {
            factors.push({
                id: 'apartment',
                label: `גודל דירה (${apartmentKey} חדרים)`,
                amount: apartmentPrice,
                kind: 'add',
            });
        }
        if (furniturePrice > 0) {
            factors.push({
                id: 'furniture',
                label: `פריטים וריהוט (${furnitureItems.reduce((s, i) => s + (i.quantity || 0), 0)} יח׳)`,
                amount: Math.round(furniturePrice),
                kind: 'add',
            });
        }
        if (floorPriceRaw > 0) {
            factors.push({
                id: 'floors',
                label: `קומות (הפרש ${floorDifference})`,
                amount: Math.round(floorPriceRaw),
                kind: 'add',
            });
        }
        if (elevatorSavings > 0) {
            factors.push({
                id: 'elevator_discount',
                label: 'הנחת מעלית על עלות קומות',
                amount: -elevatorSavings,
                kind: 'discount',
            });
        }
        if (cranePrice > 0) {
            const sides = [originHasCrane && 'מוצא', destinationHasCrane && 'יעד'].filter(Boolean).join(' + ');
            factors.push({
                id: 'crane',
                label: `מנוף (${sides})`,
                amount: cranePrice,
                kind: 'add',
            });
        }

        // ביטחון כנה לפי שלמות הנתונים — שוק ישראלי דורש אישור טלפוני
        let confidence = 50;
        if (furnitureItems.length > 0) confidence += 18;
        if (apartmentKey) confidence += 12;
        if (typeof input.floorDifference === 'number') confidence += 8;
        if (hasElevator || input.hasElevator === false) confidence += 6;
        if (originHasCrane || destinationHasCrane) confidence += 4;
        if (input.hasAddresses) confidence += 5;
        if (input.moveDateKnown) confidence += 3;
        confidence = Math.min(92, confidence);

        const confidenceLabel =
            confidence >= 80 ? 'גבוהה' : confidence >= 65 ? 'בינונית-גבוהה' : confidence >= 50 ? 'בינונית' : 'ראשונית';

        // טווח צר יותר כשיש יותר נתונים (עדיין לא התחייבות)
        const spreadLow = confidence >= 80 ? 0.94 : confidence >= 65 ? 0.91 : 0.88;
        const spreadHigh = confidence >= 80 ? 1.10 : confidence >= 65 ? 1.13 : 1.18;

        const notes: string[] = [
            'המחיר הסופי מאושר בשיחת טלפון — מקובל בענף ההובלות בישראל.',
            'ההערכה בשקלים (₪). מע״מ לפי סוג העוסק יופיע בחשבונית הרשמית.',
        ];
        if (!apartmentKey) {
            notes.push('חסר גודל דירה — ההערכה מבוססת בעיקר על פריטים וגישה.');
        }
        if (!input.hasAddresses) {
            notes.push('מרחק בין כתובות יתווסף באישור הסופי אם נדרש.');
        }
        if (furnitureItems.some(i => i.type === 'other')) {
            notes.push('יש פריט מסוג "אחר" — ייתכן עדכון מחיר לאחר פירוט.');
        }

        return {
            currency: 'ILS',
            estimatedTotal,
            minEstimate: Math.round(estimatedTotal * spreadLow),
            maxEstimate: Math.round(estimatedTotal * spreadHigh),
            factors,
            confidence,
            confidenceLabel,
            notes,
            algorithmVersion: 'il-movers-v1',
            vatNote: 'הסכום המוצג הוא אומדן לפני/כולל מע״מ לפי מדיניות העסק; חשבונית רשמית תקבע את המע״מ.',
        };
    }

    /**
     * חישוב מחיר לפי סוג דירה
     */
    private static calculateApartmentTypePrice(apartmentType: string): number {
        const apartmentPrices: { [key: string]: number } = {
            '1.5': 200,
            '2': 300,
            '2.5': 400,
            '3': 500,
            '3.5': 600,
            '4': 700,
            '4.5': 800,
            '5+': 1000
        };

        return apartmentPrices[apartmentType] || 500;
    }

    /**
     * מחירי פירוק/הרכבה ייעודיים לפריט - חלק מהפריטים (בעיקר ארונות) מתומחרים
     * בנפרד מהמחיר הגלובלי (disassemblePrice/reassemblePrice) כי העבודה שונה בהיקפה.
     * משמש גם ב-calculateFurniturePrice וגם ב-getItemPrice, כדי שלא יהיה כפל קוד/סתירה.
     */
    private static getDisassembleFees(itemType: string): { disassemblePrice: number; reassemblePrice: number } {
        switch (itemType) {
            case 'cabinet_small':
                return { disassemblePrice: 250, reassemblePrice: 350 };
            case 'cabinet_large':
                return { disassemblePrice: 300, reassemblePrice: 500 };
            case 'cabinet':
                return { disassemblePrice: 275, reassemblePrice: 425 };
            case 'wardrobe':
                return { disassemblePrice: 200, reassemblePrice: 250 }; // סה"כ פירוק+הרכבה: 450 ₪
            case 'wardrobe_3_door':
                return { disassemblePrice: 220, reassemblePrice: 280 }; // סה"כ: 500 ₪
            case 'wardrobe_4_door':
                return { disassemblePrice: 260, reassemblePrice: 340 }; // סה"כ: 600 ₪
            case 'wardrobe_sliding':
                return { disassemblePrice: 240, reassemblePrice: 310 }; // סה"כ: 550 ₪
            case 'built_in_closet':
                return { disassemblePrice: 300, reassemblePrice: 400 }; // סה"כ: 700 ₪
            default:
                return {
                    disassemblePrice: this.PRICING_CONFIG.disassemblePrice,
                    reassemblePrice: this.PRICING_CONFIG.reassemblePrice
                };
        }
    }

    /**
     * חישוב מחיר רהיטים
     */
    private static calculateFurniturePrice(furnitureItems: FurnitureItem[]): number {
        let totalPrice = 0;

        for (const item of furnitureItems) {
            const pricing = this.FURNITURE_PRICING[item.type] || this.FURNITURE_PRICING.other;
            let itemPrice = pricing.basePrice * item.quantity;

            // מכפיל לפריטים שבירים
            if (pricing.fragile) {
                itemPrice *= this.PRICING_CONFIG.fragileMultiplier;
            }

            // מחיר פירוק והרכבה מלאים - מחירים שונים לארונות
            if (pricing.needsDisassemble) {
                const { disassemblePrice, reassemblePrice } = this.getDisassembleFees(item.type);
                itemPrice += (disassemblePrice + reassemblePrice) * item.quantity;
            }

            // הסרת דלתות בלבד (למשל כדי לעבור בפתח צר) - שירות נפרד, רלוונטי רק
            // לפריטים עם דלתות (ארונות/מזנונים - אלו שהוגדרו כניתנים לפירוק).
            if (item.needsDoorRemoval && pricing.needsDisassemble) {
                itemPrice += this.PRICING_CONFIG.doorRemovalPrice * item.quantity;
            }

            totalPrice += itemPrice;
        }

        return totalPrice;
    }

    /**
     * חישוב מחיר קומות
     */
    private static calculateFloorPrice(floorDifference: number, hasElevator: boolean): number {
        let floorPrice = floorDifference * this.PRICING_CONFIG.floorPrice;

        // הנחה במעלית
        if (hasElevator) {
            floorPrice *= this.PRICING_CONFIG.elevatorDiscount;
        }

        return floorPrice;
    }

    /**
     * חישוב מחיר מרחק (לעתיד)
     */
    private static calculateDistancePrice(originAddress: string, destinationAddress: string): number {
        // כאן יהיה חישוב מרחק אמיתי
        // כרגע נחזיר ערך קבוע
        return 100;
    }

    /**
     * קבלת מחיר לפריט ספציפי
     */
    static getItemPrice(itemType: string, quantity: number = 1): {
        basePrice: number;
        totalPrice: number;
        needsDisassemble: boolean;
        isFragile: boolean;
        description: string;
        disassemblePrice?: number;
        reassemblePrice?: number;
        doorRemovalPrice?: number;
    } {
        const pricing = this.FURNITURE_PRICING[itemType] || this.FURNITURE_PRICING.other;
        let totalPrice = pricing.basePrice * quantity;

        if (pricing.fragile) {
            totalPrice *= this.PRICING_CONFIG.fragileMultiplier;
        }

        let disassemblePrice = 0;
        let reassemblePrice = 0;

        if (pricing.needsDisassemble) {
            const fees = this.getDisassembleFees(itemType);
            disassemblePrice = fees.disassemblePrice;
            reassemblePrice = fees.reassemblePrice;
            totalPrice += (disassemblePrice + reassemblePrice) * quantity;
        }

        return {
            basePrice: pricing.basePrice,
            totalPrice: Math.round(totalPrice),
            needsDisassemble: pricing.needsDisassemble,
            isFragile: pricing.fragile,
            description: pricing.description,
            disassemblePrice,
            reassemblePrice,
            doorRemovalPrice: pricing.needsDisassemble ? this.PRICING_CONFIG.doorRemovalPrice : 0
        };
    }

    /**
     * קבלת רשימת כל הפריטים עם מחירים - כולל פירוט עלויות פירוק/הרכבה/הסרת
     * דלתות לכל פריט, כדי שה-frontend יוכל להציג מחיר ליד כל מוצר בטופס
     * בלי לשכפל את לוגיקת התמחור בצד הלקוח.
     */
    static getAllFurniturePricing(): Array<{
        type: string;
        basePrice: number;
        description: string;
        isFragile: boolean;
        needsDisassemble: boolean;
        maxQuantity: number;
        category: string;
        disassemblePrice: number;
        reassemblePrice: number;
        doorRemovalPrice: number;
    }> {
        return Object.entries(this.FURNITURE_PRICING).map(([type, pricing]) => {
            const fees = pricing.needsDisassemble
                ? this.getDisassembleFees(type)
                : { disassemblePrice: 0, reassemblePrice: 0 };

            return {
                type,
                basePrice: pricing.basePrice,
                description: pricing.description,
                isFragile: pricing.fragile,
                needsDisassemble: pricing.needsDisassemble,
                maxQuantity: pricing.maxQuantity,
                category: pricing.category,
                disassemblePrice: fees.disassemblePrice,
                reassemblePrice: fees.reassemblePrice,
                doorRemovalPrice: pricing.needsDisassemble ? this.PRICING_CONFIG.doorRemovalPrice : 0
            };
        });
    }

    /**
     * חישוב מחיר מינימלי להובלה
     */
    static getMinimumPrice(): number {
        return this.PRICING_CONFIG.basePrice + this.calculateApartmentTypePrice('1.5');
    }

    /**
     * חישוב מחיר מקסימלי להובלה
     */
    static getMaximumPrice(): number {
        return this.PRICING_CONFIG.basePrice + this.calculateApartmentTypePrice('5+') + 2000;
    }
}