import express from "express";
import { getRates, convertCurrency  } from "../controllers/currencyConversaion.js";


const router = express.Router();

// GET /api/currency/rates/USD  (base defaults to USD if omitted)
router.get("/rates/:base?", getRates);

// GET /api/currency/convert?amount=100&from=USD&to=NGN
router.get("/convert", convertCurrency);

export default router;