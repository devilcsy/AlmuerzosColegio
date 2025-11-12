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
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: amount } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Balance added successfully',
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding balance',
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
// 🔗 Vincular hijo con padre
export const linkChild = async (req, res) => {
  try {
    const { childId } = req.body;

    if (req.user.role !== 'PARENT') {
      return res.status(403).json({
        success: false,
        message: 'Only parents can link children'
      });
    }

    const child = await User.findById(childId);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    if (child.parent) {
      return res.status(400).json({ success: false, message: 'This child already has a parent' });
    }

    // Vincular
    child.parent = req.user._id;
    await child.save();

    req.user.children.push(child._id);
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Child linked successfully',
      child
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// 💰 Recargar saldo de un hijo
// userController.js
export const rechargeChild = async (req, res) => {
  try {
    const { childId, amount } = req.body;

    if (!childId || !amount) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const parent = await User.findById(req.user._id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({ success: false, message: 'No puedes recargar a este hijo' });
    }

    const child = await User.findById(childId);
    child.balance += parseFloat(amount);
    await child.save();

    res.json({ success: true, message: 'Saldo recargado', child });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

