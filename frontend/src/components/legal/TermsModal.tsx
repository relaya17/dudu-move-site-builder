
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { legalConfig } from '@/config/legal';

export const TermsModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm">תנאי שימוש והגבלת אחריות</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>תנאי שימוש והגבלת אחריות</DialogTitle>
          <DialogDescription>
            גרסה {legalConfig.termsOfService.version} | עודכן לאחרונה: {legalConfig.termsOfService.lastUpdated}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {legalConfig.termsOfService.sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <p className="text-gray-600">{section.content}</p>
              </div>
            ))}

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">הגבלת אחריות וביטוח</h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  סכום האחריות המקסימלי: {legalConfig.liability.maxAmount.toLocaleString()} ₪
                </p>
                <div>
                  <h4 className="font-medium mb-2">פריטים שאינם מכוסים:</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {legalConfig.liability.excludedItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">דרישות להגשת תביעה:</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {legalConfig.liability.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-600">
                  יש להגיש תביעה תוך {legalConfig.liability.timeLimit} ימים מיום ההובלה
                </p>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">הסכם שירות</h3>
              {legalConfig.serviceAgreement.sections.map((section, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-medium mb-2">{section.title}</h4>
                  <p className="text-gray-600">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};