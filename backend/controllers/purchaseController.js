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
// Obtener compras de un hijo (solo para padres)
export const getChildPurchases = async (req, res) => {
  try {
    const { childId } = req.params;

    const child = await User.findById(childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    if (String(child.parent) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this child\'s purchases' });
    }

    const purchases = await Purchase.find({ user: childId }).sort({ createdAt: -1 });
    res.json({ success: true, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// purchasesController.js
export const buyLunchForChild = async (req, res) => {
  try {
    const { childId, lunchId } = req.body;

    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({ success: false, message: 'No puedes comprar para este hijo' });
    }

    const child = await User.findById(childId);
    const lunch = await Lunch.findById(lunchId);

    if (child.balance < lunch.price) {
      return res.status(400).json({ success: false, message: 'Saldo insuficiente' });
    }

    child.balance -= lunch.price;
    await child.save();

    const purchase = new Purchase({
      user: child._id,
      lunch: lunch._id,
      amount: lunch.price,
    });
    await purchase.save();

    res.json({ success: true, message: 'Compra realizada', purchase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
