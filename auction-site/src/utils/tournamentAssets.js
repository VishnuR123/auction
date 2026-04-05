/**
 * Public assets per tournament: /tournaments/{tournamentId}/...
 * Example: tournamentAssetUrl("2026-ipl", "owners", "vishnu.png")
 * → "/tournaments/2026-ipl/owners/vishnu.png"
 */
export function tournamentAssetUrl(tournamentId, ...pathSegments) {
  const clean = pathSegments
    .filter((s) => s != null && s !== "")
    .map((s) => String(s).replace(/^\/+|\/+$/g, ""))
    .join("/");
  return `/tournaments/${tournamentId}/${clean}`;
}

/** Tournament branding logo — prefer `public/tournaments/{id}/branding/logo.png`. */
export function tournamentLogoPngUrl(tournamentId) {
  return tournamentAssetUrl(tournamentId, "branding", "logo.png");
}

/** Fallback when PNG is missing: `branding/logo.svg`. */
export function tournamentLogoSvgUrl(tournamentId) {
  return tournamentAssetUrl(tournamentId, "branding", "logo.svg");
}

/**
 * Use as `<img onError={tournamentLogoImgOnError(id, opts)} />`.
 * After `logo.png` fails to load, tries `logo.svg` once; then hides or dims.
 */
export function tournamentLogoImgOnError(
  tournamentId,
  { finalFailure = "hide" } = {},
) {
  return (e) => {
    const el = e.currentTarget;
    if (el.dataset.tournamentLogoFallback === "1") {
      if (finalFailure === "dim") {
        el.style.opacity = "0.2";
      } else {
        el.style.visibility = "hidden";
      }
      return;
    }
    el.dataset.tournamentLogoFallback = "1";
    el.src = tournamentLogoSvgUrl(tournamentId);
  };
}
