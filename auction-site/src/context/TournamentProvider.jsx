import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/client.js";
import {
  TOURNAMENT_OVERRIDES,
  getTournamentOverride,
} from "../config/tournamentRegistry.js";
import { tournamentAssetUrl } from "../utils/tournamentAssets.js";
import { TournamentContext } from "./tournamentContext.js";

function buildResolvedRegistry(apiTournaments) {
  const merged = new Map();

  for (const doc of apiTournaments) {
    if (!doc?._id) continue;
    merged.set(doc._id, {
      id: doc._id,
      label: doc.name ?? doc._id,
      mode: "live",
    });
  }

  for (const override of TOURNAMENT_OVERRIDES) {
    const base = merged.get(override.id) ?? {};
    merged.set(override.id, {
      ...base,
      ...override,
    });
  }

  return [...merged.values()];
}

function pickDefaultTournamentId(apiTournaments, registry) {
  const active = apiTournaments.find((t) => t?._id && t.isActive !== false);
  if (active?._id) return active._id;

  const firstLive = registry.find((r) => r.mode === "live");
  if (firstLive) return firstLive.id;

  return registry[0]?.id ?? "2025-ipl";
}

export function TournamentProvider({ children }) {
  const [apiTournaments, setApiTournaments] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet("/api/tournaments")
      .then((rows) => {
        if (!cancelled) {
          setApiTournaments(Array.isArray(rows) ? rows : []);
          setApiError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setApiTournaments([]);
          setApiError(e.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const registry = useMemo(
    () => buildResolvedRegistry(apiTournaments),
    [apiTournaments]
  );

  const getRegistryEntry = useCallback(
    (tournamentId) =>
      registry.find((t) => t.id === tournamentId) ??
      getTournamentOverride(tournamentId) ??
      null,
    [registry]
  );

  const isLiveTournament = useCallback(
    (tournamentId) => getRegistryEntry(tournamentId)?.mode === "live",
    [getRegistryEntry]
  );

  const defaultTournamentId = useMemo(
    () => pickDefaultTournamentId(apiTournaments, registry),
    [apiTournaments, registry]
  );

  const getLiveDoc = useCallback(
    (tournamentId) => apiTournaments.find((t) => t._id === tournamentId),
    [apiTournaments]
  );

  const value = useMemo(
    () => ({
      registry,
      apiTournaments,
      apiError,
      loading,
      defaultTournamentId,
      getRegistryEntry,
      isLiveTournament,
      getLiveDoc,
      tournamentAssetUrl,
    }),
    [
      registry,
      apiTournaments,
      apiError,
      loading,
      defaultTournamentId,
      getRegistryEntry,
      isLiveTournament,
      getLiveDoc,
    ]
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}
