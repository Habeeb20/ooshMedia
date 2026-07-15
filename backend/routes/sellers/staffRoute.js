// routes/staffRoutes.js
import express from 'express';

import { verifyToken } from '../../middleware/verifyToken.js';
import { requireControlRoomAuth } from '../../middleware/controlRoomAuth.js';
import { activateCreatorControlRoom,  reissueCreatorCode,
  controlRoomLogin,
  createStaff,
  listStaff,
  toggleStaffActive,
  updateStaffPermissions,
  removeStaff,
  staffPOSLogin,
  getStaffSalesSummary, } from '../../controllers/sellers/staffController.js';
const router = express.Router();

// Creator-side, normal seller auth
router.post('/activate-creator', verifyToken, activateCreatorControlRoom);
router.post('/reissue-creator-code', verifyToken, reissueCreatorCode);
router.post('/control-room/login', verifyToken, controlRoomLogin);
router.post('/pos-login', verifyToken, staffPOSLogin);

// Control-room-scoped (short-lived token from control-room/login)
router.post('/', requireControlRoomAuth, createStaff);
router.get('/', requireControlRoomAuth, listStaff);
router.put('/:id/active', requireControlRoomAuth, toggleStaffActive);
router.put('/:id/permissions', requireControlRoomAuth, updateStaffPermissions);
router.delete('/:id', requireControlRoomAuth, removeStaff);
router.get('/sales-summary', requireControlRoomAuth, getStaffSalesSummary);

export default router;