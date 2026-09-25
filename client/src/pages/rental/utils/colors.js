// Design tokens for the rental feature — built around the brand primary #8B1E3F.
// A deep wine/burgundy reads well for a marketplace that wants to feel a little
// premium rather than generic-SaaS-blue, so the supporting palette leans warm:
// a muted antique gold for ratings/accents (its natural complement), warm
// off-white surfaces instead of stark white, and a near-black ink instead of
// pure black for text.

export const colors = {
  primary: '#8B1E3F', // brand primary — buttons, active states, links
  primaryDark: '#5E1329', // hover/active/pressed
  primaryTint: '#F3E4E8', // soft backgrounds for badges, selected chips
  accent: '#B8902E', // muted gold — ratings, highlights, "featured" markers
  ink: '#221B1D', // primary text
  inkMuted: '#6B6067', // secondary text
  surface: '#FFFFFF',
  surfaceMuted: '#FAF6F7', // page background
  border: '#E7DEE1',
  success: '#2F6846',
  danger: '#B3261E',
  warning: '#9A6B12',
};

// Tailwind arbitrary-value helpers so components don't repeat hex strings.
export const tw = {
  bgPrimary: 'bg-[#8B1E3F]',
  bgPrimaryDark: 'bg-[#5E1329]',
  bgPrimaryTint: 'bg-[#F3E4E8]',
  textPrimary: 'text-[#8B1E3F]',
  textInk: 'text-[#221B1D]',
  textInkMuted: 'text-[#6B6067]',
  borderDefault: 'border-[#E7DEE1]',
  ring: 'ring-[#8B1E3F]',
  accentText: 'text-[#B8902E]',
};

// Suggested type pairing: a serif display face for titles/prices (gives the
// marketplace a boutique feel) with a plain sans for body/UI text.
// e.g. Tailwind config:
//   fontFamily: { display: ['"Fraunces"', 'serif'], sans: ['"Inter"', 'sans-serif'] }