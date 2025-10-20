// routes/users.js
import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  addBalance, 
  getAllUsers 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/balance', addBalance);
router.get('/all', authorize('ADMIN'), getAllUsers);

export default router;