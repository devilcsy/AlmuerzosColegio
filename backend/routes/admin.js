import express from 'express';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren ser ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// Obtener todas las compras
router.get('/purchases', async (req, res) => {
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
      message: 'Error al obtener compras'
    });
  }
});

// Obtener estadísticas del sistema
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalStaff = await User.countDocuments({ role: 'STAFF' });
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });
    
    const totalPurchases = await Purchase.countDocuments();
    const totalRevenue = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const recentPurchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalStaff,
        totalAdmins,
        totalPurchases,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentPurchases
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// Editar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role, department, studentId, balance, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department, studentId, balance, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
});

// Agregar saldo a usuario
router.post('/users/:id/balance', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { balance: amount } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Saldo agregado exitosamente',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar saldo'
    });
  }
});

export default router;