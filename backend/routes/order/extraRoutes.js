// routes/posRoutes.js
import express from 'express';
import {verifyToken, sellerOnly} from '../../middleware/verifyToken.js';
import  {createPOSSale, getPOSReceipt, getPOSHistory } from '../../controllers/order/posController.js';



const posRouter = express.Router();
posRouter.use(verifyToken);
posRouter.use(verifyToken, sellerOnly);
posRouter.post('/sale', createPOSSale);
posRouter.get('/history', getPOSHistory);
posRouter.get('/receipt/:txId', getPOSReceipt);

export { posRouter };


import {getSellerAnalytics, getBuyerAnalytics, getSellerCustomers} from "../../controllers/order/analyticsController.js"


const analyticsRouter = express.Router();
analyticsRouter.use(verifyToken);
analyticsRouter.get('/seller', sellerOnly, getSellerAnalytics);
analyticsRouter.get('/buyer', getBuyerAnalytics);
analyticsRouter.get('/customers', sellerOnly, getSellerCustomers);

export { analyticsRouter };
