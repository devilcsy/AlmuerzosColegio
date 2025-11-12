// routes/purchases.js
import express from 'express';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import {
  createPurchase,
  getChildPurchases
} from '../controllers/purchaseController.js';

const router = express.Router();


router.post('/', protect, createPurchase);


router.get('/child/:childId', protect, authorize('PARENT'), getChildPurchases);


router.post('/recharge-child', protect, authorize('PARENT'), async (req, res) => {
  try {
    const { childId, amount } = req.body;

    if (!childId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar childId y amount'
      });
    }

    const parent = await User.findById(req.user._id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Padre no encontrado'
      });
    }

    // Validar que el hijo pertenezca al padre
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes recargar saldo a este hijo'
      });
    }

    const child = await User.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Hijo no encontrado'
      });
    }

    // Aumentar saldo
    child.balance += Number(amount);
    await child.save();

    res.json({
      success: true,
      message: `Saldo recargado correctamente para ${child.name}`,
      newBalance: child.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al recargar saldo del hijo',
      error: error.message
    });
  }
});

// 🧾 Obtener compras del usuario autenticado
router.get('/my-purchases', protect, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({
      success: true,
      purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener compras',
      error: error.message
    });
  }
});

export default router;
