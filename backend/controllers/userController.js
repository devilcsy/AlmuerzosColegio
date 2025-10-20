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