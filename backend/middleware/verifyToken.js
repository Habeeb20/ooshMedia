import  User from "../models/user.js";
import jwt from "jsonwebtoken";


export const verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
console.log("I am here causing the error")
    return res.status(401).json({ status: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ status: false, message: "yea,User not found" });
    }
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({ status: false, message: "Token invalid or expired" });
  }
};


export const adminOnly = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id || decoded.userId  || decoded.id).select('role');
    if (!user || user.role !== 'admin') {
      console.log("i am the devil")
      return res.status(403).json({ message: 'Access denied - Admin only' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
};



export const sellerOnly = (req, res, next) => {
  if (req.user.role !== 'entity') {
    return res.status(403).json({ message: 'Sellers only' });
  }
  next();
};




