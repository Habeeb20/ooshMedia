






















import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDb } from "./db.js";

// routes
import authRoutes from "./routes/userRoute.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/sellers/productRoutes.js";
import chainRoutes from "./routes/sellers/distributionChainRoutes.js";
import postRoutes from "./routes/post/postRoutes.js";
import adRoutes from "./routes/adRoutes.js";
import cartRoutes from "./routes/order/cartRoutes.js";
import orderRoutes from "./routes/order/orderRoutes.js";
import { posRouter, analyticsRouter } from "./routes/order/extraRoutes.js";
import dealsRoutes from "./routes/deals/dealsRoute.js";
import chatpostRoutes from "./routes/post/chatRoutes.js";
import riderRouter from "./routes/riderRoute.js";
import deliveryRoutes from "./routes/deliveryRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRouter from "./routes/adminRoute.js";
import walletRoutes from "./routes/walletRoute.js";
import priceCheckerRoutes from "./routes/priceCheckerRouter.js";
import staffRoutes from "./routes/sellers/staffRoute.js"
import verificationRoutes from "./routes/verifyNgRoute.js"

dotenv.config();
connectDb();

const app = express();

/**
 * Security / caching control
 */
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});

/**
 * Body parsing
 */
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Middleware
 */
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(morgan("dev"));

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/inventory", productRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chain", chainRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chatposts", chatpostRoutes);
app.use("/api/price-checker", priceCheckerRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pos", posRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/deals", dealsRoutes);
app.use("/api/rider", riderRouter);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/identity-verification', verificationRoutes);

// Start server
const port = process.env.PORT || 2020;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

})