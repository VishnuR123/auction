import { useEffect, useState } from "react";
import T20wc24Shell from "../tournaments/t20wc24/T20wc24Shell.jsx";
import { T20WC24_DATA_URL } from "../tournaments/t20wc24/t20wc24Paths.js";

/**
 * T20 World Cup 2024 dashboard (original UI under src/tournaments/t20wc24), fed by
 * /tournaments/2024-t20wc/data/export_t20wc_24.json.
 */
export default function T20wc24TournamentEntry() {
  const [players, setPlayers] = useState([]);
  const [ownerPoints, setOwnerPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(T20WC24_DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText || String(r.status));
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPlayers(Array.isArray(data.players) ? data.players : []);
        const owners = Array.isArray(data.owners) ? data.owners : [];
        setOwnerPoints([...owners].reverse());
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="t20wc24-boot">
        <p>Loading T20 World Cup 2024…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="t20wc24-boot t20wc24-boot--error">
        <p>Could not load T20 WC 24 data ({error}).</p>
        <p className="t20wc24-boot__hint">
          Add <code>export_t20wc_24.json</code> under{" "}
          <code>public/tournaments/2024-t20wc/data/</code>.
        </p>
      </div>
    );
  }

  return <T20wc24Shell players={players} ownerPoints={ownerPoints} />;
}
