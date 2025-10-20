// routes/lunches.js
import express from 'express';
import Lunch from '../models/Lunch.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los almuerzos
router.get('/', async (req, res) => {
  try {
    const lunches = await Lunch.find();
    res.json({
      success: true,
      lunches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lunches'
    });
  }
});

// Agregar almuerzo (solo admin)
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const lunch = await Lunch.create(req.body);
    res.status(201).json({
      success: true,
      lunch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lunch'
    });
  }
});

export default router;