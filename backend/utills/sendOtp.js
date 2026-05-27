import otpGenerator from 'otp-generator';
import { sendEmail } from './sendEmail.js';
import axios  from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

// In-memory store (use Redis in production)
const otpStore = new Map();

export const generateAndSendOTP = async ({ contact, type }) => {
  const otp = otpGenerator.generate(4, { 
    upperCaseAlphabets: false, 
    lowerCaseAlphabets: false, 
    specialChars: false 
  });

  const expiresAt = Date.now() + OTP_EXPIRY;

  otpStore.set(contact, { otp, expiresAt, type });

  if (type === 'email') {
    const html = `
      <div style="font-family: Arial; padding: 20px; max-width: 500px;">
        <h2>Your OTP Code</h2>
        <h1 style="color: #8B1E3F; font-size: 42px; letter-spacing: 8px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore.</p>
      </div>
    `;

    await sendEmail({
      to: contact,
      subject: "Your Verification Code",
      html
    });

  } else if (type === 'phone') {
    const message = `Your ${process.env.APP_NAME || 'MediaPulse'} verification code is: ${otp}. Valid for 10 minutes.`;

    await sendSMSViaKudi(contact, message);
  }

  return otp;
};

const sendSMSViaKudi = async (phone, message) => {
  try {
    const response = await axios.post('https://my.kudisms.net/api/corporate', {
      token: process.env.KUDI_API_KEY,
      senderID: process.env.KUDI_SENDER_ID,
      recipients: phone,
      message: message,
    });

    if (response.data.status !== 'success') {
      throw new Error(response.data || 'SMS failed');
    }
  } catch (error) {
    console.error('Kudi SMS Error:', error.response?.data.message || error.message);
    throw new Error('Failed to send SMS');
  }
};

export const verifyOTP = (contact, enteredOtp) => {
  const record = otpStore.get(contact);
  if (!record) return { success: false, message: "OTP expired or invalid" };

  if (Date.now() > record.expiresAt) {
    otpStore.delete(contact);
    return { success: false, message: "OTP has expired" };
  }

  if (record.otp !== enteredOtp) {
    return { success: false, message: "Invalid OTP" };
  }

  otpStore.delete(contact);
  return { success: true };
};