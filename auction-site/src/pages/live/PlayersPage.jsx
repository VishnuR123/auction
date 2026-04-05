import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Alert, Spin } from "antd";
import { useTournamentSquadData } from "../../hooks/useTournamentSquadData.js";
import PlayerPageView from "../../components/player/PlayerPageView.jsx";

export default function PlayersPage() {
  const { tournamentId } = useParams();
  const { data, loading, error } = useTournamentSquadData(tournamentId);

  const ownerById = useMemo(() => {
    const owners = data?.owners;
    if (!owners?.length) return {};
    return Object.fromEntries(owners.map((o) => [o._id, o]));
  }, [data]);

  if (loading) {
    return (
      <div className="live-page live-page--centered">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Could not load players" description={error} showIcon />
    );
  }

  if (!data) return null;

  return (
    <div className="live-page">
      <PlayerPageView
        players={data.players}
        ownerById={ownerById}
        tournament={data.tournament}
      />
    </div>
  );
}
