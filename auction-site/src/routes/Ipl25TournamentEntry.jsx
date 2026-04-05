import { useEffect, useState } from "react";
import Ipl25Shell from "../tournaments/ipl25/Ipl25Shell.jsx";
import { IPL25_DATA_URL } from "../tournaments/ipl25/ipl25Paths.js";

/**
 * Full IPL25 dashboard (original UI under src/tournaments/ipl25), fed by
 * /tournaments/2025-ipl/data/export_ipl25.json (players + owners matchday rows).
 */
export default function Ipl25TournamentEntry() {
  const [players, setPlayers] = useState([]);
  const [ownerPoints, setOwnerPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(IPL25_DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText || String(r.status));
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPlayers(Array.isArray(data.players) ? data.players : []);
        const owners = Array.isArray(data.owners) ? data.owners : [];
        // API returned newest match first; export JSON is oldest-first.
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
      <div className="ipl25-boot">
        <p>Loading IPL 25…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ipl25-boot ipl25-boot--error">
        <p>Could not load IPL 25 data ({error}).</p>
        <p className="ipl25-boot__hint">
          Add <code>export_ipl25.json</code> under{" "}
          <code>public/tournaments/2025-ipl/data/</code>.
        </p>
      </div>
    );
  }

  return <Ipl25Shell players={players} ownerPoints={ownerPoints} />;
}
