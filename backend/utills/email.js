import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"MediaPulse" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send email");
  }
};