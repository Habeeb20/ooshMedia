import crypto from "crypto";
import Voucher from "../models/Voucher.js";

// Excludes 0/O/1/I to avoid ambiguity when a user types the code manually.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length = 10) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
  }
  return out;
}

export default async function generateUniqueVoucherCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `VC-${randomSegment(10)}`;
    const exists = await Voucher.exists({ code });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique voucher code — please retry.");
}
