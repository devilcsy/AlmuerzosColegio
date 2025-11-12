// controllers/purchaseController.js
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Lunch from '../models/Lunch.js'; 

// Crear una compra (para usuario o hijo)
export const createPurchase = async (req, res) => {
  try {
    const { items, totalAmount, type, childId } = req.body;

    // Verificar quién realiza la compra
    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Determinar si la compra es para el propio usuario o para un hijo
    let targetUser = buyer;

    if (buyer.role === 'PARENT') {
      if (!childId) {
        return res.status(400).json({ success: false, message: 'Debe especificar el ID del hijo' });
      }

      const child = await User.findById(childId);
      if (!child) {
        return res.status(404).json({ success: false, message: 'Hijo no encontrado' });
      }

      // Verificar que el hijo pertenece al padre
      if (!buyer.children.includes(childId)) {
        return res.status(403).json({ success: false, message: 'No estás autorizado para comprar para este hijo' });
      }

      targetUser = child;
    }

    // Verificar saldo suficiente
    if (targetUser.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente en la cuenta de ${targetUser.name}`
      });
    }

    // Crear compra
    const purchase = await Purchase.create({
      user: targetUser._id,
      items,
      totalAmount,
      type,
      purchasedByParent: buyer.role === 'PARENT'
    });

    // Actualizar saldo del hijo o del propio usuario
const updatedUser = await User.findByIdAndUpdate(
  targetUser._id,
  { $inc: { balance: -totalAmount } },
  { new: true } 
);

res.status(201).json({
  success: true,
  message: `Compra realizada exitosamente ${buyer.role === 'PARENT' ? 'por el padre' : ''}`,
  purchase,
  newBalance: updatedUser.balance, 
});


  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creando la compra',
      error: error.message
    });
  }
};

// Obtener compras de un hijo (solo para padres)
export const getChildPurchases = async (req, res) => {
  try {
    const { childId } = req.params;

    const parent = await User.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Padre no encontrado' });
    }

    const child = await User.findById(childId);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Hijo no encontrado' });
    }

    // Validar que el hijo pertenezca a este padre
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver las compras de este hijo'
      });
    }

    // Buscar las compras de ese hijo
    const purchases = await Purchase.find({ user: childId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({
      success: true,
      purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las compras del hijo',
      error: error.message
    });
  }
};
