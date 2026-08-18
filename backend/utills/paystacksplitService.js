/**
 * Works out, per seller in a cart, whether they get paid directly via a
 * Paystack subaccount, or whether their share stays in the main (estore)
 * account. Rule: seller must be Super Verified AND have a Paystack
 * subaccount code on file.
 */
export function buildSellerSettlementPlan(sellerGroups, sellerDocsById) {
  return Object.values(sellerGroups).map((group) => {
    const sellerDoc = sellerDocsById.get(group.seller.toString());
    const isSuperVerify = !!sellerDoc?.sellerProfile?.isSuperVerify;
    const subaccountCode = sellerDoc?.sellerProfile?.bankDetails?.subaccountCode || null;
    const recipientCode = sellerDoc?.sellerProfile?.bankDetails?.recipientCode || null;
    const eligibleForDirectPayout = isSuperVerify && !!subaccountCode;

    return {
      seller: group.seller,
      amount: group.amount,
      platformFee: group.fee,
      sellerAmount: group.sellerAmt,
      isSuperVerify,
      subaccountCode,
      recipientCode,
      eligibleForDirectPayout,
      destination: eligibleForDirectPayout ? 'seller_subaccount' : 'estore',
    };
  });
}

/**
 * Builds a Paystack "dynamic split" object for the transaction/initialize
 * call. Only eligible sellers get listed as flat subaccount shares (their
 * sellerAmount, in kobo). Everything else — platform fee, transport fee,
 * and any ineligible seller's share — simply isn't listed, so Paystack
 * leaves it in the main/estore account.
 *
 * Returns null if no seller in the order qualifies for direct payout, in
 * which case the caller should initialize a plain (non-split) transaction.
 */
export function buildDynamicSplit(sellerSettlements) {
  const eligible = sellerSettlements.filter((s) => s.eligibleForDirectPayout);
  if (eligible.length === 0) return null;

  const subaccounts = eligible.map((s) => ({
    subaccount: s.subaccountCode,
    share: Math.round(s.sellerAmount * 100), // kobo
  }));

  return {
    type: 'flat',
    bearer_type: 'account', // estore/main account absorbs the Paystack fee
    subaccounts,
  };
}