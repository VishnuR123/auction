import { Navigate } from "react-router-dom";
import { useTournamentDirectory } from "../hooks/useTournamentDirectory.js";

export default function HomeRedirect() {
  const { loading, defaultTournamentId, apiError } = useTournamentDirectory();

  if (loading) {
    return (
      <div className="app-boot">
        <p>Loading tournaments…</p>
        {apiError ? (
          <p className="app-boot__warn">
            API: {apiError} — using registry default.
          </p>
        ) : null}
      </div>
    );
  }

  return <Navigate to={`/t/${defaultTournamentId}`} replace />;
}
