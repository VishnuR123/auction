/**
 * Live tournament UI only (`/public/owners/`). Archive shells (e.g. IPL25) use bundled
 * assets in their tournament folders — do not import this for legacy pages.
 *
 * Extension order for each basename (`ownerId-shortName`, then `ownerId`).
 */
export const OWNER_LOGO_EXTENSIONS = ["png", "svg", "webp", "jpg", "jpeg"];

/**
 * Ordered URLs to try: `{ownerId}-{shortName}` for each ext, then `{ownerId}` for each ext.
 * Paths are relative to site root (Vite public/). Uses encodeURIComponent on the filename stem.
 *
 * @param {string} [ownerId]
 * @param {string} [shortName]
 * @returns {string[]}
 */
export function buildOwnerLogoUrlList(ownerId, shortName) {
  const id = String(ownerId ?? "").trim();
  const sn = String(shortName ?? "").trim();
  const bases = [];
  if (id && sn) bases.push(`${id}-${sn}`);
  if (id) bases.push(id);
  const urls = [];
  for (const base of bases) {
    for (const ext of OWNER_LOGO_EXTENSIONS) {
      urls.push(`/owners/${encodeURIComponent(base)}.${ext}`);
    }
  }
  return urls;
}
