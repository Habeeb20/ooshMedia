// Soft versions of your brand colour (appConfig.colors.primary) for tinted backgrounds and borders.
// Works with #hex colours; anything else (rgb(), hsl(), a CSS variable) falls back to color-mix.
export const withAlpha = (color, alpha) => {
  const c = String(color || '').trim();
  const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map((x) => x + x).join('') : hex[1];
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  return `color-mix(in srgb, ${c} ${Math.round(alpha * 100)}%, transparent)`;
};