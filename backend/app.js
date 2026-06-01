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


app.use("/api/auth", authRoutes)

app.use('/api/seller', sellerRoutes)


app.use('/api/inventory', productRoutes);
app.use('/api/products', productRoutes);

app.use('/api/chain', chainRoutes)
app.use('/api/posts', postRoutes)

app.use('/api/ads', adRoutes);
// Start server
const port = process.env.PORT || 2020;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

})
