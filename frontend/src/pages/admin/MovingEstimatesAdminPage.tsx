import React, { useEffect, useState } from 'react';
import MovingEstimateService from '@/services/movingEstimateService';
import { MovingEstimateRequest } from '@/types/movingEstimate';

const MovingEstimatesAdminPage = () => {
  const [estimates, setEstimates] = useState<MovingEstimateRequest[]>([]);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const data = await MovingEstimateService.getAllEstimates();
        setEstimates(data);
      } catch (error) {
        console.error('Error fetching moving estimates:', error);
      }
    };
    fetchEstimates();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">ניהול הערכות מחיר להובלות דירה</h1>
      {estimates.length === 0 && <p>אין בקשות להערכת מחיר כרגע</p>}
      {estimates.map((estimate) => (
        <div key={estimate.id} className="border p-4 mb-4 rounded shadow-md bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">פרטי לקוח</h2>
              <p><strong>שם:</strong> {estimate.customerInfo.name}</p>
              <p><strong>טלפון:</strong> {estimate.customerInfo.phone}</p>
              <p><strong>אימייל:</strong> {estimate.customerInfo.email}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">פרטי הדירה</h2>
              <p><strong>סוג דירה:</strong> {estimate.apartmentDetails.apartmentType}</p>
              <p><strong>קומה:</strong> {estimate.apartmentDetails.floor || 'לא צוין'}</p>
              <p><strong>מעלית:</strong> {estimate.apartmentDetails.hasElevator ? 'יש' : 'אין'}</p>
              <p><strong>חניה:</strong> {estimate.apartmentDetails.parkingAvailable ? 'יש' : 'אין'}</p>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">פרטי ההובלה</h2>
            <p><strong>תאריך מועדף:</strong> {estimate.apartmentDetails.preferredMoveDate}</p>
            <p><strong>כתובת נוכחית:</strong> {estimate.apartmentDetails.currentAddress}</p>
            <p><strong>כתובת יעד:</strong> {estimate.apartmentDetails.destinationAddress}</p>
            <p><strong>הערות נוספות:</strong> {estimate.apartmentDetails.additionalNotes}</p>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">מצאי רהיטים</h2>
            <p><strong>סה"כ פריטים:</strong> {estimate.inventory.length}</p>
            <div className="mt-2">
              {estimate.inventory.map((item, index) => (
                <p key={index}>{item.quantity}x {item.type} {item.description ? `(${item.description})` : ''}</p>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p><strong>סטטוס:</strong> {estimate.status}</p>
            <div className="space-x-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => {/* TODO: Implement estimate approval */ }}
              >
                אשר הערכת מחיר
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {/* TODO: Implement estimate rejection */ }}
              >
                דחה בקשה
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovingEstimatesAdminPage;
