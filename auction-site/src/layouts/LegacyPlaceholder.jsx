import { useParams } from "react-router-dom";
import TournamentSwitcher from "../components/TournamentSwitcher.jsx";
import { useTournamentDirectory } from "../hooks/useTournamentDirectory.js";

/**
 * Past tournaments: no Mongo wiring yet; original UIs will replace this later.
 * Static copy can live under /data/legacy/{id}.json when you add it.
 */
export default function LegacyPlaceholder() {
  const { tournamentId } = useParams();
  const { getRegistryEntry } = useTournamentDirectory();
  const entry = getRegistryEntry(tournamentId);

  return (
    <div className="legacy-placeholder">
      <header className="legacy-placeholder__bar">
        <TournamentSwitcher variant="compact" />
      </header>
      <div className="legacy-placeholder__body">
        <h1 className="legacy-placeholder__title">
          {entry?.label ?? tournamentId}
        </h1>
        <p className="legacy-placeholder__text">
          This archive tournament will load its classic layout and static data
          here. Until the legacy bundle is connected, there is nothing to show.
        </p>
        <p className="legacy-placeholder__hint">
          Optional metadata:{" "}
          <code className="legacy-placeholder__code">
            /data/legacy/{tournamentId}.json
          </code>
        </p>
      </div>
    </div>
  );
}
