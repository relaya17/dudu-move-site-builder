
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface FurnitureItem {
  id: string;
  type: string;
  quantity: number;
  needsDisassembly: boolean;
}

interface FurnitureInventoryProps {
  onInventoryChange: (inventory: FurnitureItem[]) => void;
}

export const FurnitureInventory: React.FC<FurnitureInventoryProps> = ({ onInventoryChange }) => {
  const [inventory, setInventory] = useState<FurnitureItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
const furnitureTypes = [
  'ספות',
  'שולחנות',
  'כיסאות',
  'מיטות',
  'ארונות',
  'שידות',
  'מראות',
  'שולחנות סלון',
  'שולחנות אוכל',
  'שולחנות כתיבה',
  'מדפים',
  'כוורות',
  'כוורות איחסון',
  'כוורת תלויה',
  'שידות לילה',
  'קומודה',
  'מזנון',
  'טלוויזיה',
  'מקרר',
  'מקפיא',
  'תנור',
  'מיקרוגל',
  'מדיח כלים',
  'מכונת כביסה',
  'מייבש כביסה',
  'מזגן',
  'מאוורר',
  'שקיות',
  'קרטונים',
  'תמונות',
  'שטיחים',
  'פינות אוכל',
  'כוורת לספרים',
  'ספרייה',
  'כורסאות',
  'מדפי נעליים',
  'מתקן טלוויזיה',
  'עגלה לתינוק',
  'לול תינוק',
  'שולחן החתלה',
  'שידת תינוק',
  'מיטת תינוק'
];


  const addItem = () => {
    if (!selectedType) return;

    const existingItem = inventory.find(item => item.type === selectedType);
    
    if (existingItem) {
      const updatedInventory = inventory.map(item =>
        item.type === selectedType
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setInventory(updatedInventory);
      onInventoryChange(updatedInventory);
    } else {
      const newItem: FurnitureItem = {
        id: Date.now().toString(),
        type: selectedType,
        quantity: 1,
        needsDisassembly: false
      };
      const updatedInventory = [...inventory, newItem];
      setInventory(updatedInventory);
      onInventoryChange(updatedInventory);
    }
    
    setSelectedType('');
  };

  const updateQuantity = (id: string, change: number) => {
    const updatedInventory = inventory
      .map(item => ({
        ...item,
        quantity: item.id === id ? Math.max(0, item.quantity + change) : item.quantity
      }))
      .filter(item => item.quantity > 0);
    
    setInventory(updatedInventory);
    onInventoryChange(updatedInventory);
  };

  const toggleDisassembly = (id: string) => {
    const updatedInventory = inventory.map(item =>
      item.id === id ? { ...item, needsDisassembly: !item.needsDisassembly } : item
    );
    setInventory(updatedInventory);
    onInventoryChange(updatedInventory);
  };

  const removeItem = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    onInventoryChange(updatedInventory);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>מלאי רהיטים וחפצים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="furnitureType">הוסף פריט</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג רהיט או חפץ" />
              </SelectTrigger>
              <SelectContent>
                {furnitureTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addItem} disabled={!selectedType}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף
            </Button>
          </div>
        </div>

        {inventory.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">פריט</TableHead>
                  <TableHead className="text-right">כמות</TableHead>
                  <TableHead className="text-right">פירוק והרכבה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={item.needsDisassembly ? "default" : "outline"}
                        onClick={() => toggleDisassembly(item.id)}
                      >
                        {item.needsDisassembly ? "כן" : "לא"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        הסר
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
