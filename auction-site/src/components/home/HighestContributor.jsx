import { useMemo } from "react";
import { sumPlayerFinalForMatches } from "../../lib/buildHomeDashboard.js";
import "./homeWidgets.css";

export default function HighestContributor({
  hoveredOwnerId,
  players,
  matchNumbers,
}) {
  const { highestContributor, highestPoints, contributingPlayers } = useMemo(() => {
    if (!hoveredOwnerId || !matchNumbers?.length) {
      return {
        highestContributor: null,
        highestPoints: 0,
        contributingPlayers: [],
      };
    }

    const squad = players.filter((p) => p.ownerId === hoveredOwnerId);
    let best = null;
    let bestPts = 0;
    const list = [];

    for (const player of squad) {
      const total = sumPlayerFinalForMatches(player, matchNumbers);
      if (total > 0) {
        list.push({ name: player.name, points: total });
      }
      if (total > bestPts) {
        bestPts = total;
        best = player;
      }
    }

    list.sort((a, b) => b.points - a.points);

    if (best) {
      return {
        highestContributor: best,
        highestPoints: bestPts,
        contributingPlayers: list,
      };
    }
    return {
      highestContributor: null,
      highestPoints: 0,
      contributingPlayers: [],
    };
  }, [hoveredOwnerId, players, matchNumbers]);

  return (
    <>
      {highestContributor ? (
        <>
          <h3 className="highest-contributor-title">
            Highest contributor: <br /> {highestContributor.name}
          </h3>
          <p className="points">Points: {highestPoints.toFixed(2)}</p>
          <ul className="contributing-players-list">
            {contributingPlayers.map((player) => (
              <li
                key={player.name}
                className={
                  player.name === highestContributor.name
                    ? "highest-contributor-item"
                    : "contributor-item"
                }
              >
                <span className="player-name">{player.name} &nbsp;</span>
                <span className="player-points">{player.points.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="home-hc-hint">Hover a team in today points</p>
      )}
    </>
  );
}
