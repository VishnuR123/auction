/**
 * Tournament overrides (manual, code-owned).
 *
 * Everything coming from /api/tournaments is treated as `mode: "live"` by default.
 * Add entries here only when a tournament needs special handling:
 * - mode "ipl25": static bundle under src/tournaments/ipl25 + public/tournaments/2025-ipl/data/
 * - mode "t20wc24": static bundle under src/tournaments/t20wc24 + public/tournaments/2024-t20wc/data/
 * - mode "ipl24": IPL 2024 fantasy (Excel + JSON under public/tournaments/2024-ipl/data/)
 * - mode "wc23": WC 2023 fantasy (Excel + JSON under public/tournaments/2023-wc/data/)
 * - mode "t20wc26": empty shell for manual T20 WC 26 UI (src/tournaments/t20wc26/)
 * - mode "ct25": CT 25 XP shell (src/tournaments/ct25/)
 * - mode "ipl23": IPL 2023 XP shell + PDF (src/tournaments/ipl23/)
 * - mode "legacy": placeholder/archive view
 */
export const TOURNAMENT_OVERRIDES = [
  { id: "2026-t20wc", label: "T20WC 26", mode: "t20wc26" },
  { id: "2025-ipl", label: "IPL 25", mode: "ipl25" },
  { id: "2025-ct", label: "CT 25", mode: "ct25" },
  { id: "2024-t20wc", label: "T20WC 24", mode: "t20wc24" },
  { id: "2024-ipl", label: "IPL 24", mode: "ipl24" },
  { id: "2023-wc", label: "WC 23", mode: "wc23" },
  { id: "2023-ipl", label: "IPL 23", mode: "ipl23" },
];

/** @param {string | null | undefined} id */
export function getTournamentOverride(id) {
  if (!id) return null;
  return TOURNAMENT_OVERRIDES.find((t) => t.id === id) ?? null;
}
