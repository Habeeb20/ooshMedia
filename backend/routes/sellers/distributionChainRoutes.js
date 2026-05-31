import express from 'express';
import { searchDistributionChain } from '../../controllers/sellers/distributionChainController.js';


const router = express.Router();

router.get('/search', searchDistributionChain);

export default router;