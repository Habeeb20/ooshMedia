
import User from "../models/user.js"


import express from "express"
import {adminLogin, getInspectionSellers, updateAddressVerification, updateSuperVerify} from "../controllers/adminController.js"
import { getDashboardData } from '../controllers/dashboardController.js';
import { getAdminOverview,
  getAllUsersAdmin,
  getUserFullProfileAdmin,
  getAllProductsAdmin,
  getAllOrdersAdmin,
  getAllPostsAdmin,
  getAllRidersAdmin,
  getAllSellersAdmin,
  updateUserStatusAdmin,
  deleteUserAdmin,
 } from '../controllers/adminController.js';
import { verifyToken, adminOnly } from '../middleware/verifyToken.js';
import { getAllSettlements, getSettlementSummary, payoutSettlement, retryPayout } from "../controllers/order/adminSettlementController.js";


const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/dashboard/overview', verifyToken, adminOnly, getAdminOverview);

adminRouter.get('/users', verifyToken, adminOnly, getAllUsersAdmin);
adminRouter.get('/users/:id', verifyToken, adminOnly, getUserFullProfileAdmin);
adminRouter.put('/users/:id/status', verifyToken, adminOnly, updateUserStatusAdmin);
adminRouter.delete('/users/:id', verifyToken, adminOnly, deleteUserAdmin);

adminRouter.get('/products', verifyToken, adminOnly, getAllProductsAdmin);
adminRouter.get('/orders', verifyToken, adminOnly, getAllOrdersAdmin);
adminRouter.get('/posts', verifyToken, adminOnly, getAllPostsAdmin);
adminRouter.get('/riders', verifyToken, adminOnly, getAllRidersAdmin);
adminRouter.get('/sellers', verifyToken, adminOnly, getAllSellersAdmin);
adminRouter.get('/sellers/inspections', verifyToken, adminOnly, getInspectionSellers);
adminRouter.put('/sellers/:id/address-verify', verifyToken, adminOnly, updateAddressVerification);
adminRouter.put('/sellers/:id/super-verify', verifyToken, adminOnly, updateSuperVerify);

adminRouter.get('/settlements', verifyToken, adminOnly, getAllSettlements);
adminRouter.get('/settlements/summary', verifyToken, adminOnly,  getSettlementSummary);
adminRouter.post('/settlements/:id/pay', verifyToken, adminOnly,  payoutSettlement);
adminRouter.post('/settlements/:id/retry', verifyToken, adminOnly, retryPayout);
export default adminRouter;