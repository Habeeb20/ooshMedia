import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      currentRole: user.currentRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Estores" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};
