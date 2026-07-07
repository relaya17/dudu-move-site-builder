import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PaymentMethod } from 'shared';

// מעל סכום זה חובה לרשום ת.ז/ח.פ הלקוח על הקבלה - ר' backend/src/services/InvoiceService.ts
// (CUSTOMER_ID_REQUIRED_THRESHOLD) שהוא מקור האמת/האכיפה בפועל; הערך כאן רק
// לצורך הצגת השדה כחובה מוקדם ככל האפשר ב-UI, לפני שהבקשה בכלל נשלחת לשרת.
const CUSTOMER_ID_REQUIRED_THRESHOLD = 5000;

interface IssueInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPrice: number;
  customerName: string;
  loading?: boolean;
  onConfirm: (details: { paymentMethod: PaymentMethod; customerIdNumber?: string }) => void;
}

/**
 * דיאלוג "פרטי תשלום" לפני הפקת קבלה/חשבונית - אמצעי תשלום הוא שדה חובה לפי
 * הוראות ניהול ספרים, ות.ז/ח.פ הלקוח הופך לחובה מעל 5,000 ₪ (חוק צמצום השימוש
 * במזומן). זו הדרך היחידה להפיק חשבונית במערכת - אין מסלול שמדלג על המסך הזה.
 */
export function IssueInvoiceDialog({
  open,
  onOpenChange,
  totalPrice,
  customerName,
  loading,
  onConfirm,
}: IssueInvoiceDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [customerIdNumber, setCustomerIdNumber] = useState('');

  const idRequired = totalPrice > CUSTOMER_ID_REQUIRED_THRESHOLD;
  const canConfirm = Boolean(paymentMethod) && (!idRequired || customerIdNumber.trim().length > 0);

  const handleConfirm = () => {
    if (!paymentMethod || !canConfirm) return;
    onConfirm({ paymentMethod, customerIdNumber: customerIdNumber.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>פרטי תשלום להפקת קבלה</DialogTitle>
          <DialogDescription>
            עבור {customerName} · סכום לתשלום: ₪{totalPrice.toLocaleString('he-IL')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="payment-method">
              אמצעי תשלום <span className="text-red-600">*</span>
            </Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="בחר/י אמצעי תשלום" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              חובה לציין על גבי קבלה לפי הוראות ניהול ספרים.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-id">
              ת.ז. / ח.פ הלקוח {idRequired && <span className="text-red-600">*</span>}
            </Label>
            <Input
              id="customer-id"
              value={customerIdNumber}
              onChange={(e) => setCustomerIdNumber(e.target.value)}
              placeholder="מספר תעודת זהות או ח.פ"
              dir="ltr"
              className="text-right"
            />
            <p className="text-xs text-muted-foreground">
              {idRequired
                ? `חובה לרשום מעל ₪${CUSTOMER_ID_REQUIRED_THRESHOLD.toLocaleString('he-IL')} (חוק צמצום השימוש במזומן).`
                : 'אופציונלי מתחת לסכום זה.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            ביטול
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || loading}>
            {loading ? 'מפיק קבלה...' : 'הפק קבלה/חשבונית'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
