import { Router } from 'express';
import moveRequestRoutes from './moveRequestRoutes';
import moveRoutes from './moves';
import moveTypesRoutes from './moveTypes';
import moveItemsRoutes from './moveItems';
import aiRoutes from './aiRoutes';
import { PricingService } from '../services/PricingService';

const router = Router();

// הגדרת routes
router.use('/move-requests', moveRequestRoutes);
router.use('/moves', moveRoutes);
router.use('/move-types', moveTypesRoutes);
router.use('/move-items', moveItemsRoutes);
router.use('/ai', aiRoutes);

// Route לקבלת מחירי רהיטים
router.get('/furniture-pricing', (req, res) => {
  try {
    const pricing = PricingService.getAllFurniturePricing();
    const minPrice = PricingService.getMinimumPrice();
    const maxPrice = PricingService.getMaximumPrice();

    res.json({
      success: true,
      data: {
        furniture: pricing,
        priceRange: {
          min: minPrice,
          max: maxPrice
        }
      }
    });
  } catch (error) {
    console.error('שגיאה בקבלת מחירי רהיטים:', error);
    res.status(500).json({
      success: false,
      message: 'אירעה שגיאה בקבלת מחירי רהיטים'
    });
  }
});

// Route לחישוב מחיר פריט ספציפי
router.post('/calculate-item-price', (req, res) => {
  try {
    const { itemType, quantity = 1 } = req.body;
    
    if (!itemType) {
      return res.status(400).json({
        success: false,
        message: 'נדרש סוג פריט'
      });
    }

    const priceInfo = PricingService.getItemPrice(itemType, quantity);
    
    res.json({
      success: true,
      data: priceInfo
    });
  } catch (error) {
    console.error('שגיאה בחישוב מחיר פריט:', error);
    res.status(500).json({
      success: false,
      message: 'אירעה שגיאה בחישוב מחיר הפריט'
    });
  }
});

export default router;
