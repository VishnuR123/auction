import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  buildPlayerMatchPointsList,
  pointsObject,
  roleBucket,
  playerRowHighlightClass,
  nationalityKind,
} from "../../lib/playerView.js";
import { isUnsoldOwner } from "../../lib/ownerUtils.js";
import { useThemeMode } from "../../context/useThemeMode.js";
import { ownerShellStyleVars } from "./ownerThemeColors.js";
import OwnerLogoImg from "./OwnerLogoImg.jsx";
import "./ownerPage.css";

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a855f7"];

export default function OwnerPageView({ owners, players, matchdays }) {
  const { isDark } = useThemeMode();
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  /** Player selected to show per-match points (click row; click again to clear). */
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const sortedOwners = useMemo(
    () =>
      [...owners]
        .filter((o) => !isUnsoldOwner(o))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [owners]
  );

  const effectiveOwnerId = useMemo(() => {
    if (!sortedOwners.length) return "";
    if (
      selectedOwnerId &&
      sortedOwners.some((o) => o._id === selectedOwnerId)
    ) {
      return selectedOwnerId;
    }
    return sortedOwners[0]._id;
  }, [sortedOwners, selectedOwnerId]);

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o._id, o])),
    [owners]
  );

  const selectedOwner = ownerById[effectiveOwnerId];

  const filteredPlayers = useMemo(() => {
    if (!effectiveOwnerId) return [];
    return players
      .filter((p) => p.ownerId === effectiveOwnerId)
      .sort((a, b) => (Number(b.totalPoints) || 0) - (Number(a.totalPoints) || 0));
  }, [players, effectiveOwnerId]);

  useEffect(() => {
    setSelectedPlayer(null);
  }, [effectiveOwnerId]);

  useEffect(() => {
    setSelectedPlayer((prev) => {
      if (!prev) return null;
      return filteredPlayers.some((p) => p._id === prev._id) ? prev : null;
    });
  }, [filteredPlayers]);

  const rolePoints = useMemo(() => {
    const acc = {};
    for (const p of filteredPlayers) {
      const bucket = roleBucket(p.role);
      acc[bucket] = (acc[bucket] || 0) + (Number(p.totalPoints) || 0);
    }
    return Object.keys(acc).map((name) => ({ name, value: acc[name] }));
  }, [filteredPlayers]);

  const radarData = useMemo(() => {
    const acc = {};
    for (const p of filteredPlayers) {
      const code = p.teamCode || "—";
      acc[code] = (acc[code] || 0) + (Number(p.totalPoints) || 0);
    }
    return Object.keys(acc).map((team) => ({ team, points: acc[team] }));
  }, [filteredPlayers]);

  const sortedMds = useMemo(
    () =>
      [...matchdays].sort(
        (a, b) => Number(a.matchNumber) - Number(b.matchNumber)
      ),
    [matchdays]
  );
  const latest = sortedMds[sortedMds.length - 1];
  const latestPts = latest ? pointsObject(latest.points) : {};
  const latestOwnerPoints = effectiveOwnerId
    ? Number(latestPts[effectiveOwnerId] ?? 0)
    : 0;

  const selectedPlayerMatches = selectedPlayer
    ? buildPlayerMatchPointsList(selectedPlayer)
    : [];

  const radarMax = Math.max(1, ...radarData.map((d) => d.points));

  const ownerShellVars = useMemo(() => {
    if (!selectedOwner) return {};
    const primary =
      selectedOwner.primaryColor ?? selectedOwner.color ?? "#64748b";
    return ownerShellStyleVars(primary, isDark);
  }, [selectedOwner, isDark]);

  if (!sortedOwners.length) {
    return <p className="owner-page__empty">No owners for this tournament.</p>;
  }

  return (
    <div className="owner-page-shell" style={ownerShellVars}>
      <div className="owner-main">
      <div className="owner-logo-row">
        {sortedOwners.map((o) => (
          <button
            key={o._id}
            type="button"
            className={`owner-pick ${
              o._id === effectiveOwnerId ? "owner-pick--active" : ""
            }`}
            style={{
              backgroundColor: o.primaryColor,
              color: o.secondaryColor || "#ffffff",
            }}
            onClick={() => setSelectedOwnerId(o._id)}
            aria-label={o.name}
            title={o.name}
          >
            <OwnerLogoImg
              ownerId={o._id}
              shortName={o.shortName}
              alt=""
              className="owner-pick__logo"
              imgProps={{ "aria-hidden": true }}
              fallback={
                <span className="owner-pick__fallback">{o.shortName}</span>
              }
            />
          </button>
        ))}
      </div>

      <div className="owner-parent">
        <div className="players-list owner-container">
          {selectedOwner && (
            <div className="owner-players">
              <h3 className="owner-players__title">
                {selectedOwner.name}&apos;s players
              </h3>
              {filteredPlayers.length > 0 ? (
                <div className="owner-players__body">
                  <table className="owner-players__table">
                    <thead>
                      <tr>
                        <th scope="col">Player</th>
                        <th scope="col" className="owner-players__col-pts">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player) => {
                        const overseas =
                          nationalityKind(player.nationality) === "OVERSEAS";
                        const isSelected =
                          selectedPlayer?._id === player._id;
                        const rowClass = [
                          "owner-players__row",
                          playerRowHighlightClass(
                            player,
                            "owner-players__row"
                          ),
                          isSelected ? "owner-players__row--selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <tr
                            key={player._id || player.name}
                            className={rowClass}
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                              setSelectedPlayer((prev) =>
                                prev?._id === player._id ? null : player
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedPlayer((prev) =>
                                  prev?._id === player._id ? null : player
                                );
                              }
                            }}
                          >
                            <td>
                              <span className="owner-players__name-cell">
                                {overseas ? (
                                  <img
                                    src="/plane.png"
                                    alt=""
                                    className="owner-players__os-icon"
                                    width={14}
                                    height={14}
                                    title="Overseas player"
                                  />
                                ) : null}
                                <span className="owner-players__name">
                                  {player.name}
                                </span>
                              </span>
                            </td>
                            <td className="owner-players__col-pts">
                              {Number(player.totalPoints || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="owner-page__hint owner-players__empty">
                  No players assigned to this owner.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="country-radar owner-container">
          <h3>Points by team</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="77%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="team" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, radarMax]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Points"
                  dataKey="points"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.55}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="owner-page__hint">No points to chart yet.</p>
          )}
        </div>

        <div className="role-pie owner-container">
          <h3>Points by role</h3>
          {rolePoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart height={150}>
                <Pie
                  data={rolePoints}
                  cx="50%"
                  cy="75%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={52}
                  outerRadius={68}
                  label
                  dataKey="value"
                >
                  {rolePoints.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                  <Label
                    value={latestOwnerPoints.toFixed(1)}
                    position="center"
                    fill="currentColor"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="owner-page__hint">Select an owner with players.</p>
          )}
          <p className="role-pie__caption">Center: latest matchday owner total</p>
        </div>

        <div className="individual-points owner-container">
          {selectedPlayer ? (
            <div className="owner-match-points">
              <h3 className="owner-match-points__title">
                {selectedPlayer.name}&apos;s match points
              </h3>
              {selectedPlayerMatches.length > 0 ? (
                <div className="owner-match-points__body">
                  <table className="owner-match-points__table">
                    <thead>
                      <tr>
                        <th scope="col">Match</th>
                        <th
                          scope="col"
                          className="owner-match-points__col-pts"
                        >
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlayerMatches.map((m) => (
                        <tr key={m.matchNumber}>
                          <td>Match {m.matchNumber}</td>
                          <td className="owner-match-points__col-pts">
                            {m.points.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="owner-page__hint owner-match-points__empty">
                  No per-match scores yet.
                </p>
              )}
            </div>
          ) : (
            <div className="owner-match-points owner-match-points--idle">
              <p className="owner-match-points__placeholder">
                Click a player in the list to see their per-match points.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
