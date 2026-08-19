// scripts/backfillSettlementPayoutStatus.js
//
// One-time fix for SettlementHistory rows created before the insertMany /
// payoutStatus patch — they're all sitting at the schema default
// ('not_applicable') regardless of whether money is actually owed to a
// seller or rider. This recomputes payoutStatus for every row using the
// same logic as the pre('save') hook / computeInitialPayoutStatus helper,
// without touching anything that's already been through a real payout
// (paid / payout_failed rows are left alone).
//
// Run once with:  node scripts/backfillSettlementPayoutStatus.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SettlementHistory from './models/order/settlementHistory.js';

dotenv.config();

const computeStatus = ({ type, destination, method, riderAmount }) => {
  const oweable =
    (type === 'sale_share' && destination === 'estore' && method !== 'split') ||
    (type === 'transport_fee' && riderAmount > 0);
  return oweable ? 'owed' : 'not_applicable';
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Scanning settlement history...');

  // Only touch rows still sitting at the (likely wrong) default — never
  // overwrite anything that's already gone through a real payout attempt.
  // IMPORTANT: docs created before this field existed in the schema don't
  // have `payoutStatus` written to disk at all — an equality match on
  // 'not_applicable' alone won't find them, since Mongo doesn't match a
  // missing field against a specific value. Catch both cases explicitly.
  const rows = await SettlementHistory.find({
    $or: [{ payoutStatus: 'not_applicable' }, { payoutStatus: { $exists: false } }],
  });
  console.log(`Found ${rows.length} rows to check.`);

  let updated = 0;
  for (const row of rows) {
    const correct = computeStatus({
      type: row.type,
      destination: row.destination,
      method: row.method,
      riderAmount: row.riderAmount,
    });
    if (correct !== row.payoutStatus) {
      row.payoutStatus = correct;
      await row.save();
      updated += 1;
    }
  }

  console.log(`Done. Updated ${updated} of ${rows.length} rows.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});