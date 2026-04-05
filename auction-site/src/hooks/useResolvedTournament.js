import { useTournamentDirectory } from "./useTournamentDirectory.js";

/** Resolved view for one route param `tournamentId`. */
export function useResolvedTournament(tournamentId) {
  const { getLiveDoc, getRegistryEntry, isLiveTournament, tournamentAssetUrl: asset } =
    useTournamentDirectory();
  const entry = getRegistryEntry(tournamentId);
  const live = isLiveTournament(tournamentId);
  const liveDoc = live ? getLiveDoc(tournamentId) : null;

  const theme = liveDoc?.theme ?? {
    primaryColor: "#10044a",
    secondaryColor: "#2d1b69",
  };

  const displayName = liveDoc?.name ?? entry?.label ?? tournamentId;
  const assetBasePath = `/tournaments/${tournamentId}`;
  /** Prefer PNG; use `logoSvgUrl` or `tournamentLogoImgOnError` from `tournamentAssets.js` if only SVG exists. */
  const logoUrl = asset(tournamentId, "branding", "logo.png");
  const logoSvgUrl = asset(tournamentId, "branding", "logo.svg");

  return {
    tournamentId,
    entry,
    mode: live ? "live" : "legacy",
    liveDoc,
    displayName,
    theme,
    assetBasePath,
    logoUrl,
    logoSvgUrl,
    tournamentAssetUrl: (...parts) => asset(tournamentId, ...parts),
  };
}
