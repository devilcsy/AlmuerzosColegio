// controllers/purchaseController.js
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

export const createPurchase = async (req, res) => {
  try {
    const { items, totalAmount, type } = req.body;

    // Verificar saldo suficiente
    const user = await User.findById(req.user.id);
    if (user.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
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

    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully',
      purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
};

export const getUserPurchases = async (req, res) => {
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
      message: 'Error fetching purchases',
      error: error.message
    });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role');

    res.json({
      success: true,
      purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all purchases',
      error: error.message
    });
  }
};