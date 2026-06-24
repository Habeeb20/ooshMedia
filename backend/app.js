import express from "express"


import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDb } from "./db.js";
import authRoutes from "./routes/authRoutes.js"
import sellerRoutes from "./routes/sellerRoutes.js"
import productRoutes from './routes/sellers/productRoutes.js';
import chainRoutes from "./routes/sellers/distributionChainRoutes.js"
import postRoutes from "./routes/post/postRoutes.js"
import adRoutes from './routes/adRoutes.js';
import cartRoutes from "./routes/order/cartRoutes.js"
import orderRoutes from "./routes/order/orderRoutes.js"
import { posRouter, analyticsRouter } from "./routes/order/extraRoutes.js";
import dealsRoutes from "./routes/deals/dealsRoute.js"
import chatpostRoutes from "./routes/post/chatRoutes.js"
import User from "./models/user.js"

import riderRouter from "./routes/riderRoute.js";
import deliveryRoutes from "./routes/deliveryRoute.js"
import { createServer } from 'http';
import { initSocket } from "./socket.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"
import adminRouter from "./routes/adminRoute.js";
import walletRoutes from "./routes/walletRoute.js"
import priceCheckerRoutes from "./routes/priceCheckerRouter.js"
dotenv.config();
connectDb()

const app = express()


app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(morgan("dev"));

///routes
app.get("/", (req, res) => {
  res.send("oosh media backend is listening on port....");
});

const httpServer = createServer(app);
initSocket(httpServer); 


app.use("/api/auth", authRoutes)

app.use('/api/seller', sellerRoutes)


app.use('/api/inventory', productRoutes);
app.use('/api/products', productRoutes);

app.use('/api/chain', chainRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/chatposts', chatpostRoutes);
app.use('/api/price-checker', priceCheckerRoutes)
app.use('/api/ads', adRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pos', posRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/deals', dealsRoutes);
app.use('/api/rider', riderRouter);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api', adminRouter)
// await User.create({
//   firstName: 'Admin',
//   lastName: 'Boss',
//   email: 'ooshmedia@gmail.com',
//   password: 'essential01',
//   username: "admin43",
//   role: 'admin'
// });

// console.log('Superadmin created!');


// Start server
const port = process.env.PORT || 2020;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

})













// import express from 'express';
// import { createServer } from 'http';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import cors from 'cors';

// import { initSocket } from './socket.js';
// import deliveryRoutes from './routes/deliveryRoutes.js';
// // ...your other route imports

// dotenv.config();

// const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());

// // ── Routes ────────────────────────────────────────────────────────
// app.use('/api/delivery', deliveryRoutes);
// // app.use('/api/orders', orderRoutes);
// // app.use('/api/auth', authRoutes);
// // ...rest of your routes

// // ── HTTP server + Socket.io ───────────────────────────────────────
// // IMPORTANT: wrap app in createServer BEFORE calling initSocket
// const httpServer = createServer(app);
// initSocket(httpServer);  // must come before httpServer.listen

// // ── DB + Start ────────────────────────────────────────────────────
// const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch((err) => console.error('DB connection failed:', err));