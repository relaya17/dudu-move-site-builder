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
        disassemblePrice: 200, // מחיר לפירוק בסיסי
        reassemblePrice: 150, // מחיר להרכבה בסיסית
        floorPrice: 50, // מחיר לכל קומה
        distancePrice: 2, // מחיר לכל ק"מ
        elevatorDiscount: 0.8, // הנחה במעלית (20%)
        cranePrice: 500, // מחיר להובלה בכרן
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
        bed_single: {
            basePrice: 250,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטת יחיד'
        },
        bed_double: {
            basePrice: 450,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'מיטה זוגית'
        },
        bed: {
            basePrice: 350,
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
        dining_corner_small: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'פינת אוכל קטנה'
        },
        dining_corner_medium: {
            basePrice: 500,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'פינת אוכל בינונית'
        },
        dining_corner_large: {
            basePrice: 700,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 1,
            description: 'פינת אוכל גדולה'
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
        cabinet_small: {
            basePrice: 100,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 5,
            description: 'ארון קטן'
        },
        cabinet_large: {
            basePrice: 150,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 3,
            description: 'ארון גדול'
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

        // New furniture items added below
        wardrobe_3_door: {
            basePrice: 300,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'ארון 3 דלתות'
        },
        wardrobe_4_door: {
            basePrice: 400,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'ארון 4 דלתות'
        },
        wardrobe_sliding: {
            basePrice: 350,
            fragile: false,
            needsDisassemble: true,
            maxQuantity: 2,
            description: 'ארון הזזה'
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
        bag: {
            basePrice: 20,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 20,
            description: 'שקית'
        },
        box: {
            basePrice: 20,
            fragile: false,
            needsDisassemble: false,
            maxQuantity: 20,
            description: 'קרטון'
        },
        toilette_table: {
            basePrice: 80,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 2,
            description: 'שולחן טואלט'
        },
        picture: {
            basePrice: 20,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 10,
            description: 'תמונה'
        },
        large_plants: {
            basePrice: 70,
            fragile: true,
            needsDisassemble: false,
            maxQuantity: 5,
            description: 'עצים ועציצים גדולים'
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
        hasElevator: boolean,
        originHasCrane: boolean = false,
        destinationHasCrane: boolean = false
    ): number {
        const basePrice = this.PRICING_CONFIG.basePrice;
        const apartmentPrice = this.calculateApartmentTypePrice(apartmentType);
        const furniturePrice = this.calculateFurniturePrice(furnitureItems);
        const floorPrice = this.calculateFloorPrice(floorDifference, hasElevator);

        // מחיר מנוף
        let cranePrice = 0;
        if (originHasCrane) {
            cranePrice += this.PRICING_CONFIG.cranePrice;
        }
        if (destinationHasCrane) {
            cranePrice += this.PRICING_CONFIG.cranePrice;
        }

        return basePrice + apartmentPrice + furniturePrice + floorPrice + cranePrice;
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

            // מחיר פירוק והרכבה - מחירים שונים לארונות
            if (pricing.needsDisassemble) {
                let disassemblePrice = this.PRICING_CONFIG.disassemblePrice;
                let reassemblePrice = this.PRICING_CONFIG.reassemblePrice;

                // מחירים מיוחדים לארונות
                if (item.type === 'cabinet_small') {
                    disassemblePrice = 250; // פירוק ארון קטן
                    reassemblePrice = 350;  // הרכבה ארון קטן
                } else if (item.type === 'cabinet_large') {
                    disassemblePrice = 300; // פירוק ארון גדול
                    reassemblePrice = 500;  // הרכבה ארון גדול
                } else if (item.type === 'cabinet') {
                    disassemblePrice = 275; // פירוק ארון רגיל
                    reassemblePrice = 425;  // הרכבה ארון רגיל
                }

                itemPrice += disassemblePrice + reassemblePrice;
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
    } {
        const pricing = this.FURNITURE_PRICING[itemType] || this.FURNITURE_PRICING.other;
        let totalPrice = pricing.basePrice * quantity;

        if (pricing.fragile) {
            totalPrice *= this.PRICING_CONFIG.fragileMultiplier;
        }

        let disassemblePrice = 0;
        let reassemblePrice = 0;

        if (pricing.needsDisassemble) {
            // מחירים מיוחדים לארונות
            if (itemType === 'cabinet_small') {
                disassemblePrice = 250;
                reassemblePrice = 350;
            } else if (itemType === 'cabinet_large') {
                disassemblePrice = 300;
                reassemblePrice = 500;
            } else if (itemType === 'cabinet') {
                disassemblePrice = 275;
                reassemblePrice = 425;
            } else {
                disassemblePrice = this.PRICING_CONFIG.disassemblePrice;
                reassemblePrice = this.PRICING_CONFIG.reassemblePrice;
            }

            totalPrice += disassemblePrice + reassemblePrice;
        }

        return {
            basePrice: pricing.basePrice,
            totalPrice: Math.round(totalPrice),
            needsDisassemble: pricing.needsDisassemble,
            isFragile: pricing.fragile,
            description: pricing.description,
            disassemblePrice,
            reassemblePrice
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