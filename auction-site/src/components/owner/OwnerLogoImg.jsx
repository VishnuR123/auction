import { useMemo, useState } from "react";
import { buildOwnerLogoUrlList } from "../../lib/ownerLogo.js";

/**
 * Live tournament UI only (`/public/owners/`). Archive shells use bundled assets.
 *
 * Resolves /public/owners/{ownerId}-{shortName}.{ext} then /public/owners/{ownerId}.{ext}.
 *
 * @param {React.ReactNode} [fallback] — shown when no URL list or every asset fails to load.
 */
export default function OwnerLogoImg({
  ownerId,
  shortName,
  alt = "",
  className = "",
  imgProps = {},
  fallback = null,
}) {
  const urls = useMemo(
    () => buildOwnerLogoUrlList(ownerId, shortName),
    [ownerId, shortName]
  );
  const [idx, setIdx] = useState(0);

  if (urls.length === 0 || idx >= urls.length) {
    return fallback;
  }

  return (
    <img
      src={urls[idx]}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      {...imgProps}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
