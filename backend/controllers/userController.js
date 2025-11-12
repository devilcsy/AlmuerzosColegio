// controllers/userController.js
import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, department },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

export const addBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: numericAmount } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Balance agregado correctamente',
      balance: user.balance, 
    });
  } catch (error) {
    console.error('Error al recargar saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar saldo',
      error: error.message
    });
  }
};


// Admin functions
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};
// Vincular hijo al padre usando studentId o nombre
export const linkChild = async (req, res) => {
  try {
    const { identifier } = req.body; // Puede ser studentId o name

    if (req.user.role !== 'PARENT') {
      return res.status(403).json({ success: false, message: 'Solo los padres pueden vincular hijos' });
    }

    // Buscar al hijo por studentId o name (insensible a mayúsculas)
    const child = await User.findOne({
      role: 'STUDENT',
      $or: [
        { studentId: identifier },
        { name: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    });

    if (!child) {
      return res.status(404).json({ success: false, message: 'Hijo no encontrado' });
    }

    // Verificar si ya tiene padre
    if (child.parent) {
      return res.status(400).json({ success: false, message: 'Este hijo ya tiene un padre vinculado' });
    }

    // Vincular hijo al padre
    child.parent = req.user._id;
    await child.save();

    // Agregar hijo a la lista de hijos del padre
    req.user.children.push(child._id);
    await req.user.save();

    res.json({
      success: true,
      message: `Hijo ${child.name} vinculado correctamente`,
      child
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al vincular hijo', error: error.message });
  }
};


//  Obtener los hijos del padre
export const getMyChildren = async (req, res) => {
  try {
    if (req.user.role !== 'PARENT') {
      return res.status(403).json({ success: false, message: 'Only parents can view children' });
    }

    const parent = await User.findById(req.user.id).populate('children', 'name email balance');
    res.json({ success: true, children: parent.children });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const rechargeChild = async (req, res) => {
  try {
    const { childId, amount } = req.body;

    const numericAmount = parseFloat(amount);
    if (!childId || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Datos inválidos para recargar' });
    }

    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({ success: false, message: 'No puedes recargar a este hijo' });
    }

    const child = await User.findById(childId);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Hijo no encontrado' });
    }

    child.balance += numericAmount;
    await child.save();

    res.json({
      success: true,
      message: `Saldo recargado correctamente al hijo ${child.name}`,
      balance: child.balance, // 🔥 devuelve balance actualizado
      child: {
        _id: child._id,
        name: child.name,
        balance: child.balance,
      }
    });
  } catch (err) {
    console.error('Error en recarga de hijo:', err);
    res.status(500).json({ success: false, message: 'Error al recargar saldo del hijo' });
  }
};


