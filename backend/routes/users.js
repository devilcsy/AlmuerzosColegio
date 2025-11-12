// routes/users.js
import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  addBalance, 
  getAllUsers,
  linkChild,
  getMyChildren,
  rechargeChild
} from '../controllers/userController.js';

import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);


router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/balance', addBalance);


router.get('/all', authorize('ADMIN'), getAllUsers);


router.post('/link-child', authorize('PARENT'), linkChild);
router.get('/my-children', authorize('PARENT'), getMyChildren);
router.post('/recharge-child', authorize('PARENT'), rechargeChild);

export default router;
