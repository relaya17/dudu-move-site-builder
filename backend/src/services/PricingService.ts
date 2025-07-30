import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface BasePrice {
    apartment_type: string;
    base_price: number;
}

interface ItemPrice {
    name: string;
    base_price: number;
    fragile_multiplier: number;
    disassembly_price: number;
    reassembly_price: number;
}

export class PricingService {
    // מחירי בסיס לפי סוג דירה
    private static readonly BASE_PRICES: BasePrice[] = [
        { apartment_type: 'דירת סטודיו', base_price: 1000 },
        { apartment_type: 'דירת 1 חדר', base_price: 1500 },
        { apartment_type: 'דירת 2 חדרים', base_price: 2000 },
        { apartment_type: 'דירת 3 חדרים', base_price: 2500 },
        { apartment_type: 'דירת 4 חדרים', base_price: 3000 },
        { apartment_type: 'דירת 5+ חדרים', base_price: 3500 },
        { apartment_type: 'בית פרטי', base_price: 4000 },
        { apartment_type: 'משרד קטן', base_price: 2000 },
        { apartment_type: 'משרד גדול', base_price: 3500 }
    ];

    // מחירי בסיס לפריטים
    private static readonly ITEM_PRICES: ItemPrice[] = [
        {
            name: 'ספה תלת מושבית',
            base_price: 150,
            fragile_multiplier: 1.2,
            disassembly_price: 100,
            reassembly_price: 100
        },
        {
            name: 'ספה דו מושבית',
            base_price: 100,
            fragile_multiplier: 1.2,
            disassembly_price: 80,
            reassembly_price: 80
        },
        {
            name: 'כורסא',
            base_price: 75,
            fragile_multiplier: 1.2,
            disassembly_price: 50,
            reassembly_price: 50
        },
        {
            name: 'מיטה זוגית',
            base_price: 120,
            fragile_multiplier: 1.0,
            disassembly_price: 100,
            reassembly_price: 100
        },
        {
            name: 'ארון בגדים גדול',
            base_price: 200,
            fragile_multiplier: 1.3,
            disassembly_price: 150,
            reassembly_price: 150
        },
        {
            name: 'שולחן אוכל',
            base_price: 100,
            fragile_multiplier: 1.5,
            disassembly_price: 80,
            reassembly_price: 80
        },
        {
            name: 'מקרר',
            base_price: 180,
            fragile_multiplier: 1.4,
            disassembly_price: 0,
            reassembly_price: 0
        },
        {
            name: 'מכונת כביסה',
            base_price: 150,
            fragile_multiplier: 1.3,
            disassembly_price: 0,
            reassembly_price: 0
        },
        {
            name: 'טלוויזיה',
            base_price: 80,
            fragile_multiplier: 2.0,
            disassembly_price: 0,
            reassembly_price: 0
        }
    ];

    // חישוב מחיר בסיס לפי סוג דירה
    static getBasePrice(apartmentType: string): number {
        const priceInfo = this.BASE_PRICES.find(p => p.apartment_type === apartmentType);
        return priceInfo ? priceInfo.base_price : 0;
    }

    // חישוב מחיר לפריט בודד
    static calculateItemPrice(
        itemName: string,
        quantity: number,
        isFragile: boolean,
        needsDisassemble: boolean,
        needsReassemble: boolean
    ): number {
        const itemPrice = this.ITEM_PRICES.find(p => p.name === itemName);
        if (!itemPrice) return 0;

        let totalPrice = itemPrice.base_price;

        // תוספת עבור שבירות
        if (isFragile) {
            totalPrice *= itemPrice.fragile_multiplier;
        }

        // תוספת עבור פירוק והרכבה
        if (needsDisassemble) {
            totalPrice += itemPrice.disassembly_price;
        }
        if (needsReassemble) {
            totalPrice += itemPrice.reassembly_price;
        }

        return totalPrice * quantity;
    }

    // חישוב מחיר כולל למעבר
    static calculateTotalPrice(
        apartmentType: string,
        items: Array<{
            name: string;
            quantity: number;
            isFragile?: boolean;
            needsDisassemble?: boolean;
            needsReassemble?: boolean;
        }>,
        floorDifference: number,
        hasElevator: boolean
    ): {
        basePrice: number;
        itemsPrice: number;
        floorPrice: number;
        additionalFee: number;
        totalPrice: number;
        disclaimer: {
            text: string;
            legalNotice: string;
        };
    } {
        // מחיר בסיס לפי סוג דירה
        const basePrice = this.getBasePrice(apartmentType);

        // מחיר פריטים
        const itemsPrice = items.reduce((total, item) => {
            return total + this.calculateItemPrice(
                item.name,
                item.quantity,
                item.isFragile || false,
                item.needsDisassemble || false,
                item.needsReassemble || false
            );
        }, 0);

        // תוספת מחיר עבור קומות
        let floorPrice = 0;
        if (!hasElevator && floorDifference > 0) {
            floorPrice = floorDifference * 100; // 100 ש"ח לכל קומה ללא מעלית
        }

        // תוספת קבועה של 1000 ש"ח למחיר הסופי
        const additionalFee = 1000;
        const totalPrice = basePrice + itemsPrice + floorPrice + additionalFee;

        return {
            basePrice,
            itemsPrice,
            floorPrice,
            additionalFee,
            totalPrice,
            disclaimer: {
                text: 'המחיר הינו הערכה בלבד ועשוי להשתנות בהתאם לשינויים בפועל. המחיר הסופי ייקבע לאחר בדיקה מדויקת של הפריטים והתנאים בשטח.',
                legalNotice: 'בהזמנת שירות ההובלה, הלקוח מסכים לתנאי השירות ומודע לכך שהחברה אחראית עד לסכום מקסימלי של 50,000 ש"ח בלבד לנזקים שעשויים להיגרם במהלך ההובלה, בכפוף לתנאי הביטוח.'
            }
        };
    }
}