
import User from "../models/user.js"


import express from "express"
import {adminLogin} from "../controllers/adminController.js"
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


const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/admin/dashboard/overview', verifyToken, adminOnly, getAdminOverview);

adminRouter.get('/admin/users', verifyToken, adminOnly, getAllUsersAdmin);
adminRouter.get('/admin/users/:id', verifyToken, adminOnly, getUserFullProfileAdmin);
adminRouter.put('/admin/users/:id/status', verifyToken, adminOnly, updateUserStatusAdmin);
adminRouter.delete('/admin/users/:id', verifyToken, adminOnly, deleteUserAdmin);

adminRouter.get('/admin/products', verifyToken, adminOnly, getAllProductsAdmin);
adminRouter.get('/admin/orders', verifyToken, adminOnly, getAllOrdersAdmin);
adminRouter.get('/admin/posts', verifyToken, adminOnly, getAllPostsAdmin);
adminRouter.get('/admin/riders', verifyToken, adminOnly, getAllRidersAdmin);
adminRouter.get('/admin/sellers', verifyToken, adminOnly, getAllSellersAdmin);

export default adminRouter;