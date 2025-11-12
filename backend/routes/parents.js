// routes/parents.js
import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();


router.get('/search-child', protect, authorize('PARENT'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar un nombre o ID para buscar'
      });
    }

    // Buscar por studentId o name (ignorando mayúsculas/minúsculas)
    const child = await User.findOne({
      $or: [
        { studentId: query },
        { name: { $regex: new RegExp(`^${query}$`, 'i') } }
      ]
    }).select('-password'); // no devolver password

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró ningún hijo con ese nombre o ID'
      });
    }

    res.json({
      success: true,
      child
    });
  } catch (error) {
    console.error('Error buscando hijo:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al buscar hijo'
    });
  }
});

export default router;
