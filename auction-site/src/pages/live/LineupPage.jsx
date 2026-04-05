import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Card,
  Empty,
  Masonry,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useTournamentSquadData } from "../../hooks/useTournamentSquadData.js";
import { isUnsoldOwner } from "../../lib/ownerUtils.js";
import "./lineupPage.css";

function teamCodesForTournament(tournament, players) {
  const fromDoc = Array.isArray(tournament?.teams) ? tournament.teams : [];
  if (fromDoc.length) {
    return [...fromDoc].sort((a, b) => String(a).localeCompare(String(b)));
  }
  const set = new Set();
  for (const p of players) {
    if (p?.teamCode) set.add(String(p.teamCode));
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * @param {object[]} players
 * @param {string} a
 * @param {string} b
 * @param {Record<string, object>} ownerById
 */
function buildOwnerGroups(players, a, b, ownerById) {
  const codes = new Set([a, b]);
  const filtered = players.filter(
    (p) => p?.teamCode && codes.has(String(p.teamCode))
  );
  /** @type {Map<string, { ownerId: string, players: object[], total: number }>} */
  const map = new Map();
  for (const p of filtered) {
    const oid = p.ownerId;
    if (!oid) continue;
    const owner = ownerById[oid];
    if (isUnsoldOwner(owner)) continue;
    let g = map.get(oid);
    if (!g) {
      g = { ownerId: oid, players: [], total: 0 };
      map.set(oid, g);
    }
    g.players.push(p);
    g.total += Number(p.totalPoints) || 0;
  }
  for (const g of map.values()) {
    g.players.sort((x, y) =>
      String(x.name || "").localeCompare(String(y.name || ""))
    );
  }
  return [...map.values()].sort((x, y) => y.total - x.total);
}

export default function LineupPage() {
  const { tournamentId } = useParams();
  const { data, loading, error } = useTournamentSquadData(tournamentId);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);

  const ownerById = useMemo(() => {
    const owners = data?.owners;
    if (!owners?.length) return {};
    return Object.fromEntries(owners.map((o) => [o._id, o]));
  }, [data]);

  const teamCodes = useMemo(() => {
    if (!data) return [];
    return teamCodesForTournament(data.tournament, data.players);
  }, [data]);

  const options1 = useMemo(
    () =>
      teamCodes
        .filter((c) => c !== team2)
        .map((c) => ({ label: c, value: c })),
    [teamCodes, team2]
  );

  const options2 = useMemo(
    () =>
      teamCodes
        .filter((c) => c !== team1)
        .map((c) => ({ label: c, value: c })),
    [teamCodes, team1]
  );

  const groups = useMemo(() => {
    if (!data?.players || !team1 || !team2) return [];
    return buildOwnerGroups(data.players, team1, team2, ownerById);
  }, [data, team1, team2, ownerById]);

  const masonryItems = useMemo(
    () =>
      groups.map((g) => ({
        key: g.ownerId,
        data: g,
      })),
    [groups]
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
        message="Could not load lineup data"
        description={error}
        showIcon
      />
    );
  }

  if (!data) return null;

  return (
    <div className="live-page lineup-page lineup-page--fill">
      <header className="lineup-page__top lineup-page__content-width">
        <Typography.Title level={5} className="lineup-page__title">
          Lineup
        </Typography.Title>
        <p className="lineup-page__intro">
          Two teams → owners sorted by points.
        </p>

        <Space wrap className="lineup-page__toolbar" size="small">
          <div className="lineup-page__field">
            <span className="lineup-page__label">Team 1</span>
            <Select
              allowClear
              placeholder="Select team"
              className="lineup-page__select"
              options={options1}
              value={team1}
              onChange={(v) => setTeam1(v ?? null)}
            />
          </div>
          <div className="lineup-page__field">
            <span className="lineup-page__label">Team 2</span>
            <Select
              allowClear
              placeholder="Select team"
              className="lineup-page__select"
              options={options2}
              value={team2}
              onChange={(v) => setTeam2(v ?? null)}
            />
          </div>
        </Space>
      </header>

      {!teamCodes.length ? (
        <div className="lineup-page__content-width">
          <Empty
            className="lineup-page__empty"
            description="No team codes for this tournament"
          />
        </div>
      ) : !team1 || !team2 ? (
        <div className="lineup-page__content-width">
          <Empty
            className="lineup-page__empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Select two different teams"
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="lineup-page__content-width">
          <Empty
            className="lineup-page__empty"
            description="No players found for this matchup"
          />
        </div>
      ) : (
        <div className="lineup-page__scroll">
          <div className="lineup-page__masonry-wrap lineup-page__content-width">
            <Masonry
              columns={{ xs: 1, sm: 2 }}
              gutter={[12, 12]}
              items={masonryItems}
              itemRender={({ data: g }) => {
                const owner = ownerById[g.ownerId];
                const title = owner?.name ?? owner?.shortName ?? g.ownerId;
                return (
                  <Card
                    size="small"
                    className="lineup-owner-card"
                    title={
                      <div className="lineup-owner-card__head">
                        <span className="lineup-owner-card__name">{title}</span>
                        <span className="lineup-owner-card__pts">
                          {g.total.toFixed(2)}
                        </span>
                      </div>
                    }
                  >
                    <ul className="lineup-player-list">
                      {g.players.map((p) => (
                        <li
                          key={p._id}
                          className={`lineup-player-list__row${p.isInjured ? " lineup-player-list__row--injured" : ""}`}
                        >
                          <span className="lineup-player-list__main">
                            <span className="lineup-player-list__name">
                              {p.name}
                            </span>
                            <span className="lineup-player-list__sep" aria-hidden>
                              ·
                            </span>
                            <span className="lineup-player-list__meta">
                              {p.role}
                              {p.teamCode ? ` · ${p.teamCode}` : ""}
                            </span>
                          </span>
                          <span className="lineup-player-list__pts">
                            {(Number(p.totalPoints) || 0).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
