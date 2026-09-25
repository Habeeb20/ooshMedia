import { useState } from 'react';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-[#6B6067]">{label}</span>
      <span className="text-[#221B1D] font-medium text-right">{value}</span>
    </div>
  );
}

function Badge({ children, tone = 'wine' }) {
  const tones = {
    wine: 'bg-[#8B1E3F]/10 text-[#8B1E3F] border-[#8B1E3F]/20',
    gold: 'bg-amber-50 text-amber-700 border-amber-200',
    gray: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

// `owner` is the populated User document returned alongside the item
// (password + raw ID numbers already stripped server-side).
export default function OwnerProfileCard({ owner, ratingAverage, ratingCount, totalBookings }) {
  const [expanded, setExpanded] = useState(false);
  if (!owner) return null;

  const joined = owner.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    : null;

  const isVerified =
    owner.identityVerification?.approved ||
    owner.businessProfile?.verified ||
    owner.sellerProfile?.verifiedSeller;

  return (
    <div className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
      <div className="flex items-start gap-4">
        <img
          src={owner.profilePicture || `https://ui-avatars.com/api/?name=${owner.firstName}+${owner.lastName}&background=8B1E3F&color=fff`}
          alt={`${owner.firstName} ${owner.lastName}`}
          className="h-14 w-14 rounded-full object-cover border border-[#E7DEE1]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg text-[#221B1D]">
              Hosted by {owner.firstName} {owner.lastName?.[0]}.
            </h3>
            {isVerified && <Badge>Verified</Badge>}
            {owner.sellerProfile?.isSuperVerify && <Badge tone="gold">Super Verified</Badge>}
          </div>
          <p className="text-sm text-[#6B6067] mt-0.5">
            {joined ? `Joined ${joined}` : ''}
            {totalBookings ? ` · ${totalBookings} rentals completed` : ''}
            {ratingCount ? ` · ${ratingAverage?.toFixed(1)}★ (${ratingCount})` : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-4 w-full rounded-lg border border-[#8B1E3F] text-[#8B1E3F] text-sm font-medium py-2 hover:bg-[#8B1E3F]/5 transition-colors"
      >
        {expanded ? 'Hide profile details' : 'View full profile'}
      </button>

      {expanded && (
        <div className="mt-4 divide-y divide-[#F3E4E8] border-t border-[#F3E4E8] pt-2">
          <InfoRow label="Username" value={owner.username} />
          <InfoRow label="Phone" value={owner.phoneNumber} />
          <InfoRow label="Alternate contact" value={owner.alternateContact} />
          <InfoRow label="Email" value={owner.email} />
          <InfoRow label="Location" value={[owner.lga, owner.state].filter(Boolean).join(', ')} />
          <InfoRow label="Account type" value={owner.role} />

          {owner.businessProfile?.businessName && (
            <>
              <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[#8B1E3F]">
                Business
              </div>
              <InfoRow label="Business name" value={owner.businessProfile.businessName} />
              <InfoRow label="Address" value={owner.businessProfile.businessAddress} />
              <InfoRow label="Years in business" value={owner.businessProfile.yearsInBusiness} />
              <InfoRow label="Staff count" value={owner.businessProfile.staffCount} />
              <InfoRow
                label="Registered business"
                value={owner.businessProfile.registeredBusiness ? 'Yes' : 'No'}
              />
              {owner.businessProfile.openingHours?.length > 0 && (
                <InfoRow label="Hours" value={owner.businessProfile.openingHours.join(' · ')} />
              )}
            </>
          )}

          {owner.isSeller && (
            <>
              <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[#8B1E3F]">
                Seller
              </div>
              <InfoRow label="Seller type" value={owner.sellerProfile?.sellerTypes?.join(', ')} />
              <InfoRow label="Market" value={owner.sellerProfile?.market} />
              <InfoRow label="Shop name" value={owner.sellerProfile?.shopName} />
            </>
          )}

          {owner.isRider && (
            <>
              <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[#8B1E3F]">
                Rider
              </div>
              <InfoRow
                label="Vehicle"
                value={[owner.riderProfile?.vehicleBrand, owner.riderProfile?.vehicleModel].filter(Boolean).join(' ')}
              />
              <InfoRow label="Rider rating" value={owner.riderProfile?.rating?.toFixed?.(1)} />
              <InfoRow label="Deliveries completed" value={owner.riderProfile?.completedDeliveries} />
            </>
          )}
        </div>
      )}
    </div>
  );
}