interface PricingConfig {
    basePrice: number;
    pricePerItem: number;
    fragileMultiplier: number;
    disassemblePrice: number;
    reassemblePrice: number;
    floorPrice: number;
    distancePrice: number;
    elevatorDiscount: number;
}

interface FurnitureItem {
    type: string;
    quantity: number;
    description?: string;
}

interface FurniturePricing {
    [key: string]: {
        basePrice: number;
        fragile: boolean;
        needsDisassemble: boolean;
        maxQuantity: number;
        description: string;
    };
}

export class PricingService {
    private static readonly PRICING_CONFIG: PricingConfig = {
        basePrice: 500, // מחיר בסיס להובלה
        pricePerItem: 50, // מחיר לכל פריט נוסף
        fragileMultiplier: 1.5, // מכפיל לפריטים שבירים
        disassemblePrice: 100, // מחיר לפירוק
        reassemblePrice: 150, // מחיר להרכבה
        floorPrice: 50, // מחיר לכל קומה
        distancePrice: 2, // מחיר לכל ק"מ
        elevatorDiscount: 0.8, // הנחה במעלית (20%)
    };

    private static readonly FURNITURE_PRICING: FurniturePricing = {
        // רהיטי ישיבה
        sofa: {
            basePrice: 300,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'ספה'
        },
        chair: {
            basePrice: 50,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'כיסא'
        },
        armchair: {
            basePrice: 120,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 4,
            description: 'כורסה'
        },

        // רהיטי שינה
        bed: {
            basePrice: 200,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטה'
        },
        mattress: {
            basePrice: 80,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'מזרן'
        },
        wardrobe: {
            basePrice: 250,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'ארון בגדים'
        },

        // רהיטי עבודה ואוכל
        table: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 4,
            description: 'שולחן'
        },
        desk: {
            basePrice: 180,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'שולחן עבודה'
        },
        dining_table: {
            basePrice: 200,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'שולחן אוכל'
        },

        // מכשירים אלקטרוניים
        tv: {
            basePrice: 120,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'טלוויזיה'
        },
        computer: {
            basePrice: 80,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'מחשב'
        },
        refrigerator: {
            basePrice: 400,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מקרר'
        },
        washing_machine: {
            basePrice: 200,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מכונת כביסה'
        },
        dishwasher: {
            basePrice: 180,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מדיח כלים'
        },

        // ארונות ואחסון
        cabinet: {
            basePrice: 120,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 5,
            description: 'ארון'
        },
        bookshelf: {
            basePrice: 100,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מדף ספרים'
        },
        drawer: {
            basePrice: 80,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 4,
            description: 'מגירה'
        },

        // מכשירים קטנים
        microwave: {
            basePrice: 60,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מיקרוגל'
        },
        toaster: {
            basePrice: 30,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'טוסטר'
        },
        coffee_machine: {
            basePrice: 50,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 1,
            description: 'מכונת קפה'
        },

        // פריטים אחרים
        mirror: {
            basePrice: 40,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'מראה'
        },
        lamp: {
            basePrice: 30,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'מנורה'
        },
        rug: {
            basePrice: 40,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 3,
            description: 'שטיח'
        },
        other: {
            basePrice: 50,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'אחר'
        }
    };

    /**
     * חישוב מחיר כולל להובלה
     */
    static calculateTotalPrice(
        apartmentType: string,
        furnitureItems: FurnitureItem[],
        floorDifference: number,
        hasElevator: boolean
    ): number {
        let totalPrice = this.PRICING_CONFIG.basePrice;

        // חישוב מחיר לפי סוג דירה
        totalPrice += this.calculateApartmentTypePrice(apartmentType);

        // חישוב מחיר רהיטים
        totalPrice += this.calculateFurniturePrice(furnitureItems);

        // חישוב מחיר קומות
        totalPrice += this.calculateFloorPrice(floorDifference, hasElevator);

        // חישוב מחיר מרחק (אופציונלי)
        // totalPrice += this.calculateDistancePrice(originAddress, destinationAddress);

        return Math.round(totalPrice);
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

            // מחיר פירוק
            if (pricing.needsDisassemble) {
                itemPrice += this.PRICING_CONFIG.disassemblePrice;
            }

            // מחיר הרכבה
            if (pricing.needsDisassemble) {
                itemPrice += this.PRICING_CONFIG.reassemblePrice;
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
    } {
        const pricing = this.FURNITURE_PRICING[itemType] || this.FURNITURE_PRICING.other;
        let totalPrice = pricing.basePrice * quantity;

        if (pricing.fragile) {
            totalPrice *= this.PRICING_CONFIG.fragileMultiplier;
        }

        if (pricing.needsDisassemble) {
            totalPrice += this.PRICING_CONFIG.disassemblePrice + this.PRICING_CONFIG.reassemblePrice;
        }

        return {
            basePrice: pricing.basePrice,
            totalPrice: Math.round(totalPrice),
            needsDisassemble: pricing.needsDisassemble,
            isFragile: pricing.fragile,
            description: pricing.description
        };
    }

    /**
     * קבלת רשימת כל הפריטים עם מחירים
     */
    static getAllFurniturePricing(): Array<{
        type: string;
        basePrice: number;
        description: string;
        isFragile: boolean;
        needsDisassemble: boolean;
        maxQuantity: number;
    }> {
        return Object.entries(this.FURNITURE_PRICING).map(([type, pricing]) => ({
            type,
            basePrice: pricing.basePrice,
            description: pricing.description,
            isFragile: pricing.fragile,
            needsDisassemble: pricing.needsDisassemble,
            maxQuantity: pricing.maxQuantity
        }));
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