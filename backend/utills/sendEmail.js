import nodemailer from "nodemailer";
import dotenv from 'dotenv';

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
