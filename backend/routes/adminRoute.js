// import { getAdminDashboardData, getAdminData } from "../controller/adminController.js";
import { adminOnly } from "../middleware/verifyToken.js";
import User from "../models/user.js"


import express from "express"
import {adminLogin} from "../controllers/adminController.js"
const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);

export default adminRouter;