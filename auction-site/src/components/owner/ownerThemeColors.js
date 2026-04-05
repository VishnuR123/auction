/**
 * Subtle UI tints from an owner primary (hex). Secondary is not used.
 * Page: darker, less saturated HSL from the hue.
 * Containers: transparent mix toward white / slate card base.
 */

function normalizeHex(input) {
  if (!input || typeof input !== "string") return null;
  let h = input.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return null;
  return h;
}

function hexToHsl(hex) {
  const n = normalizeHex(hex);
  if (!n) return { h: 215, s: 16, l: 47 };
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * @param {string | undefined} primaryHex
 * @param {boolean} isDark
 * @returns {Record<string, string>}
 */
export function ownerShellStyleVars(primaryHex, isDark) {
  const hex = normalizeHex(primaryHex) || "#64748b";
  const { h, s } = hexToHsl(hex);
  const pageS = Math.max(5, Math.min(24, s * 0.2));
  const pageL = isDark ? 10 : 96.4;
  const pageBg = `hsl(${Math.round(h)} ${pageS.toFixed(1)}% ${pageL.toFixed(1)}%)`;

  const containerBg = isDark
    ? `color-mix(in srgb, ${hex} 11%, #0a0b0c)`
    : `color-mix(in srgb, ${hex} 10%, #ffffff)`;

  const tableHeaderBg = isDark
    ? `color-mix(in srgb, ${hex} 8%, #141414)`
    : `color-mix(in srgb, ${hex} 6%, #f8fafc)`;

  const borderSubtle = isDark
    ? `color-mix(in srgb, ${hex} 18%, #23252a)`
    : `color-mix(in srgb, ${hex} 15%, #e8ecf1)`;

  return {
    // "--owner-page-bg": pageBg,
    "--owner-container-bg": containerBg,
    "--owner-table-header-bg": tableHeaderBg,
    "--owner-border-subtle": borderSubtle,
  };
}
