// routes/eauction.routes.js
//
// Passthrough proxy for the eAuction API. The browser calls this route on
// your own backend (same-origin, no CORS involved); this route makes the
// actual request to api.eauction.ng server-to-server and forwards the
// JSON back to the client.
//
// Mount in your main app file:
//   import eauctionRoutes from "./routes/eauction.routes.js";
//   app.use("/api/eauction", eauctionRoutes);

import express from "express";
import axios from "axios";

const router = express.Router();

const EAUCTION_BASE_URL = "https://api.eauction.ng";

/**
 * GET /api/eauction/auction/items
 * Forwards to GET https://api.eauction.ng/auction/items
 * Any query params the client sends (e.g. ?category=CARS, ?page=2) are
 * passed straight through.
 */
router.get("/auction/items", async (req, res) => {
  try {
    const { data } = await axios.get(`${EAUCTION_BASE_URL}/auction/items`, {
      params: req.query,
      headers: { Accept: "application/json" },
      timeout: 10000,
    });

    res.json(data);
  } catch (error) {
    console.error("eAuction proxy error:", error.message);

    const status = error.response?.status || 502;
    res.status(status).json({
      message: "Failed to fetch auction items from eAuction.",
    });
  }
});

export default router;