// En el backend, actualizar routes/purchases.js
import express from 'express';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Crear compra
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, type } = req.body;
    const user = await User.findById(req.user.id);

    // Verificar saldo suficiente
    if (user.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente'
      });
    }

    // Crear compra
    const purchase = await Purchase.create({
      user: req.user.id,
      items,
      totalAmount,
      type
    });

    // Actualizar saldo del usuario
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: -totalAmount } }
    );

    // Obtener usuario actualizado
    const updatedUser = await User.findById(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Compra realizada exitosamente',
      purchase,
      newBalance: updatedUser.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al realizar la compra',
      error: error.message
    });
  }
});

// Obtener compras del usuario
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
      message: 'Error al obtener compras'
    });
  }
});

export default router;