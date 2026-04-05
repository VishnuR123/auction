/** IPL 2023 XP desktop — `/t/2023-ipl/*`. */
export const IPL23_BASE = "/t/2023-ipl";

/** Assets: `public/tournaments/2023-ipl/branding/` */
export const IPL23_WALLPAPER_URL =
  "/tournaments/2023-ipl/branding/wallpaper.jpg";
/** Single PDF shown in the window (browser PDF viewer scrolls inside the iframe). */
export const IPL23_PDF_URL = "/tournaments/2023-ipl/branding/ipl23.pdf";

/**
 * URL for <iframe src>. Strips any hash on the base URL, then adds PDF open params so
 * Chrome/Edge/Safari often open at fit-to-width instead of an oversized default zoom on
 * narrow viewports (reduces horizontal panning inside the viewer).
 */
export function ipl23PdfEmbedSrc() {
  const base = IPL23_PDF_URL.replace(/#.*$/, "");
  return `${base}#page=1&view=FitH`;
}
export const IPL23_START_BUTTON_URL =
  "/tournaments/2023-ipl/branding/windows-logo.png";
