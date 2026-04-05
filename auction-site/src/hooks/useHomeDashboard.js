import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";
import { buildHomeDashboard } from "../lib/buildHomeDashboard.js";

export function useHomeDashboard(tournamentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(tournamentId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tournamentId) return;

    let cancelled = false;
    const q = encodeURIComponent(tournamentId);

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);

      Promise.all([
        apiGet(`/api/tournaments/${tournamentId}`).catch(() => null),
        apiGet(`/api/owners?tournamentId=${q}`),
        apiGet(`/api/players?tournamentId=${q}`),
        apiGet(`/api/matchdays?tournamentId=${q}`),
      ])
        .then(([tournament, owners, players, matchdays]) => {
          if (cancelled) return;
          const built = buildHomeDashboard({
            tournament: tournament || {},
            owners: Array.isArray(owners) ? owners : [],
            players: Array.isArray(players) ? players : [],
            matchdays: Array.isArray(matchdays) ? matchdays : [],
          });
          setData(built);
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e.message);
            setData(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  return {
    data: tournamentId ? data : null,
    loading: Boolean(tournamentId) && loading,
    error: tournamentId ? error : null,
  };
}
