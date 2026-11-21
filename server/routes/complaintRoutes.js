import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  checkDuplicates,
  getPublicStats
} from '../controllers/complaintController.js';
import { authenticate, authorizeRole, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public / Citizen Endpoints
router.get('/public-stats', getPublicStats);
router.post('/check-duplicate', checkDuplicates);
router.post('/', optionalAuth, upload.single('image'), createComplaint);
router.get('/', optionalAuth, getComplaints);
router.get('/:id', optionalAuth, getComplaintById);

// Department & Admin Management
router.patch(
  '/:id/status',
  authenticate,
  authorizeRole('admin', 'department'),
  upload.single('resolution_image'),
  updateComplaintStatus
);

// Admin Exclusive Assignment
router.patch(
  '/:id/assign',
  authenticate,
  authorizeRole('admin'),
  assignComplaint
);

export default router;
