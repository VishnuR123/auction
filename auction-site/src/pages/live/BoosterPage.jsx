import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Alert, Spin, Table, Typography } from "antd";
import { useTournamentSquadData } from "../../hooks/useTournamentSquadData.js";
import { cvRoleFromBoosterTag } from "../../lib/playerView.js";
import { boostedPointsForPlayer } from "../../lib/boosterPoints.js";
import "./boosterPage.css";

function buildRows(players, role, ownerById) {
  const filtered = players.filter((p) => cvRoleFromBoosterTag(p.boosterTag) === role);
  const rows = filtered.map((p) => {
    const points = Number(p.totalPoints) || 0;
    const boosted = boostedPointsForPlayer(p);
    const owner = p.ownerId ? ownerById[p.ownerId] : null;
    const ownerShortName = owner?.shortName ?? owner?.name ?? "—";
    return {
      key: p._id,
      name: p.name,
      ownerShortName,
      points,
      boosted,
    };
  });
  rows.sort((a, b) => b.boosted - a.boosted);
  return rows;
}

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 138,
    ellipsis: true,
  },
  {
    title: "Owner",
    dataIndex: "ownerShortName",
    key: "owner",
    // width: 96,
    align: "right",
    ellipsis: true,
  },
  {
    title: "Points",
    dataIndex: "points",
    key: "points",
    align: "right",
    // width: 88,
    render: (v) => (Number.isFinite(v) ? v.toFixed(2) : "—"),
  },
  {
    title: "Boosted Points",
    dataIndex: "boosted",
    key: "boosted",
    align: "right",
    width: 80,
    render: (v) => (Number.isFinite(v) ? v.toFixed(2) : "—"),
  },
];

export default function BoosterPage() {
  const { tournamentId } = useParams();
  const { data, loading, error } = useTournamentSquadData(tournamentId);

  const ownerById = useMemo(() => {
    if (!data?.owners?.length) return {};
    return Object.fromEntries(data.owners.map((o) => [o._id, o]));
  }, [data?.owners]);

  const captainRows = useMemo(
    () => (data?.players ? buildRows(data.players, "captain", ownerById) : []),
    [data?.players, ownerById]
  );

  const viceRows = useMemo(
    () => (data?.players ? buildRows(data.players, "vice", ownerById) : []),
    [data?.players, ownerById]
  );

  if (loading) {
    return (
      <div className="live-page live-page--centered">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Could not load booster data"
        description={error}
        showIcon
      />
    );
  }

  if (!data) return null;

  return (
    <div className="live-page booster-page">
      <div className="booster-page__content">
        <Typography.Title level={4} className="booster-page__title">
          Booster
        </Typography.Title>
        <p className="live-page__text booster-page__intro">
          <strong>Boosted Points</strong> = the extra gained from captain / vice
          multipliers.
        </p>

        <div className="booster-page__tables">
          <section className="booster-page__section" aria-labelledby="booster-captains">
            <Typography.Title
              level={5}
              id="booster-captains"
              className="booster-page__section-title"
            >
              Captains
            </Typography.Title>
            <Table
              size="small"
              pagination={false}
              columns={columns}
              dataSource={captainRows}
              locale={{ emptyText: "No captains" }}
              className="booster-page__table"
            />
          </section>

          <section className="booster-page__section" aria-labelledby="booster-vice">
            <Typography.Title
              level={5}
              id="booster-vice"
              className="booster-page__section-title"
            >
              Vice-captains
            </Typography.Title>
            <Table
              size="small"
              pagination={false}
              columns={columns}
              dataSource={viceRows}
              locale={{ emptyText: "No vice-captains" }}
              className="booster-page__table"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
