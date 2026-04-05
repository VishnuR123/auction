import { useParams } from "react-router-dom";
import { Alert, Spin } from "antd";
import { useTournamentSquadData } from "../../hooks/useTournamentSquadData.js";
import OwnerPageView from "../../components/owner/OwnerPageView.jsx";

export default function OwnersPage() {
  const { tournamentId } = useParams();
  const { data, loading, error } = useTournamentSquadData(tournamentId);

  if (loading) {
    return (
      <div className="live-page live-page--centered">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Could not load owners" description={error} showIcon />
    );
  }

  if (!data) return null;

  return (
    <div className="live-page">
      <OwnerPageView
        owners={data.owners}
        players={data.players}
        matchdays={data.matchdays}
      />
    </div>
  );
}
