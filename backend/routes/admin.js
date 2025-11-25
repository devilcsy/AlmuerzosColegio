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

// Vincular padre-hijo
router.post('/link-parent-child', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { parentId, childId } = req.body;

    const parent = await User.findById(parentId);
    const child = await User.findById(childId);

    if (!parent || !child) {
      return res.status(404).json({
        success: false,
        message: 'Padre o hijo no encontrado'
      });
    }

    // Verificar roles
    if (parent.role !== 'PARENT') {
      return res.status(400).json({
        success: false,
        message: 'El usuario padre debe tener rol PARENT'
      });
    }

    if (child.role !== 'STUDENT') {
      return res.status(400).json({
        success: false,
        message: 'El usuario hijo debe tener rol STUDENT'
      });
    }

    // Vincular
    if (!parent.children.includes(childId)) {
      parent.children.push(childId);
      await parent.save();
    }

    res.json({
      success: true,
      message: `Hijo ${child.name} vinculado exitosamente a ${parent.name}`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al vincular padre-hijo',
      error: error.message
    });
  }
});

// Eliminar usuario
router.delete('/users/:userId', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;

    // No permitir eliminarse a sí mismo
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propio usuario'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Opcional: Eliminar compras del usuario
    await Purchase.deleteMany({ user: userId });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

// Obtener perfil de usuario
router.get('/users/:userId/profile', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('children', 'name email balance');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message
    });
  }
});

// Cambiar rol de usuario
router.put('/users/:userId/role', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['STUDENT', 'PARENT', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Rol de ${user.name} actualizado a ${role}`,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar rol',
      error: error.message
    });
  }
});

// Activar/desactivar usuario
router.put('/users/:userId/toggle-status', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario',
      error: error.message
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