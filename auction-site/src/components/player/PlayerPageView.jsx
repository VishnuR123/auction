import { useEffect, useMemo, useState } from "react";
import { Collapse, Select, Switch } from "antd";
import {
  nationalityKind,
  roleBucket,
  roleSectionTitle,
  ROLE_ORDER,
  getPlayerListPoints,
  playerRowHighlightClass,
  auctionValuePerPrice,
} from "../../lib/playerView.js";
import { isUnsoldOwner } from "../../lib/ownerUtils.js";
import "./playerPage.css";

/** Matches `playerPage.css` mobile breakpoint for role grid — accordion only below this width. */
const MOBILE_ROLE_ACCORDION_MQ = "(max-width: 700px)";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = () => setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function PlayerPageView({ players, ownerById, tournament }) {
  const [selectedTeam, setSelectedTeam] = useState(undefined);
  const [groupByRole, setGroupByRole] = useState(false);
  const [playerType, setPlayerType] = useState("ALL");
  const [applyBoost, setApplyBoost] = useState(true);
  const [unsoldOnly, setUnsoldOnly] = useState(false);
  const [stealMode, setStealMode] = useState(false);

  const isMobileRoleAccordion = useMediaQuery(MOBILE_ROLE_ACCORDION_MQ);

  const boosters = useMemo(
    () => (Array.isArray(tournament?.boosters) ? tournament.boosters : []),
    [tournament]
  );

  const teamOptions = useMemo(() => {
    const codes = new Set();
    for (const p of players) {
      if (p.teamCode) codes.add(p.teamCode);
    }
    return Array.from(codes)
      .sort()
      .map((code) => ({ label: code, value: code }));
  }, [players]);

  const unsoldFiltered = useMemo(() => {
    if (!unsoldOnly) return players;
    return players.filter((p) => isUnsoldOwner(ownerById[p.ownerId]));
  }, [players, unsoldOnly, ownerById]);

  const teamFiltered = useMemo(() => {
    if (!selectedTeam) return unsoldFiltered;
    return unsoldFiltered.filter((p) => p.teamCode === selectedTeam);
  }, [unsoldFiltered, selectedTeam]);

  const nationalityFiltered = useMemo(() => {
    return teamFiltered.filter((p) => {
      if (playerType === "ALL") return true;
      const k = nationalityKind(p.nationality);
      if (playerType === "INDIAN") return k === "INDIAN";
      if (playerType === "OVERSEAS") return k === "OVERSEAS";
      return true;
    });
  }, [teamFiltered, playerType]);

  const finalSorted = useMemo(() => {
    return [...nationalityFiltered].sort(
      (a, b) =>
        getPlayerListPoints(b, applyBoost, boosters) -
        getPlayerListPoints(a, applyBoost, boosters)
    );
  }, [nationalityFiltered, applyBoost, boosters]);

  const stealRanking = useMemo(() => {
    return nationalityFiltered
      .filter((p) => !isUnsoldOwner(ownerById[p.ownerId]))
      .map((player) => {
        const { points, price, value } = auctionValuePerPrice(
          player,
          applyBoost,
          boosters
        );
        return { player, points, price, value };
      })
      .sort((a, b) => b.value - a.value);
  }, [nationalityFiltered, applyBoost, boosters, ownerById]);

  const ownerLabel = (player) =>
    ownerById[player.ownerId]?.shortName ??
    ownerById[player.ownerId]?.name ??
    player.ownerId ??
    "—";

  const renderTable = (rows) => (
    <div className="player-page__table-wrap">
      <table className="player-page__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <span className="player-page__th-full">Owner</span>
              <span className="player-page__th-compact">Own</span>
            </th>
            <th>Team</th>
            <th>Role</th>
            <th>
              <span className="player-page__th-full">Points</span>
              <span className="player-page__th-compact">Pts</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((player) => {
            const overseas = nationalityKind(player.nationality) === "OVERSEAS";
            const rowClass = playerRowHighlightClass(player, "player-page__row");
            const pts = getPlayerListPoints(player, applyBoost, boosters);
            return (
              <tr key={player._id || player.name} className={rowClass}>
                <td>
                  <span className="player-page__name-cell">
                    <span className="player-page__name">{player.name}</span>
                    {overseas ? (
                      <img
                        src="/plane.png"
                        alt="Overseas"
                        title="Overseas player"
                        className="player-page__overseas-icon"
                        width={16}
                        height={16}
                      />
                    ) : null}
                  </span>
                </td>
                <td>{ownerLabel(player)}</td>
                <td>{player.teamCode ?? "—"}</td>
                <td>{player.role ?? "—"}</td>
                <td>{pts.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderStealTable = () => (
    <div className="player-page__table-wrap">
      <table className="player-page__table player-page__table--steal">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>
              <span className="player-page__th-full">Owner</span>
              <span className="player-page__th-compact">Own</span>
            </th>
            <th>Team</th>
            <th>Role</th>
            <th>
              <span className="player-page__th-full">Price</span>
              <span className="player-page__th-compact">$</span>
            </th>
            <th>
              <span className="player-page__th-full">Points</span>
              <span className="player-page__th-compact">Pts</span>
            </th>
            <th>
              <span className="player-page__th-full">Value</span>
              <span className="player-page__th-compact">Val</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {stealRanking.map(({ player, points, price, value }, idx) => {
            const overseas = nationalityKind(player.nationality) === "OVERSEAS";
            const rowClass = [
              playerRowHighlightClass(player, "player-page__row"),
              idx === 0 ? "player-page__row--steal-leader" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <tr key={player._id || player.name} className={rowClass}>
                <td>{idx + 1}</td>
                <td>
                  <span className="player-page__name-cell">
                    <span className="player-page__name">{player.name}</span>
                    {overseas ? (
                      <img
                        src="/plane.png"
                        alt="Overseas"
                        title="Overseas player"
                        className="player-page__overseas-icon"
                        width={16}
                        height={16}
                      />
                    ) : null}
                  </span>
                </td>
                <td>{ownerLabel(player)}</td>
                <td>{player.teamCode ?? "—"}</td>
                <td>{player.role ?? "—"}</td>
                <td>{price.toFixed(2)}</td>
                <td>{points.toFixed(2)}</td>
                <td className="player-page__value-cell">{value.toFixed(4)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (!players.length) {
    return <p className="player-page__empty">No players for this tournament.</p>;
  }

  return (
    <div className="player-page">
      <div className="player-page__toolbar player-page__card">
        <div className="player-page__field player-page__field--select">
          <Select
            allowClear
            placeholder="All teams"
            value={selectedTeam}
            onChange={(v) => setSelectedTeam(v)}
            options={teamOptions}
            className="player-page__antd-select"
            popupMatchSelectWidth={false}
          />
        </div>

        <label className="player-page__check">
          <input
            type="checkbox"
            checked={groupByRole}
            disabled={stealMode}
            onChange={(e) => setGroupByRole(e.target.checked)}
          />
          Group by role
        </label>

        <div className="player-page__unsold-toggle">
          <span className="player-page__unsold-label">Unsold only</span>
          <Switch checked={unsoldOnly} onChange={setUnsoldOnly} />
        </div>

        <button
          type="button"
          className={`player-page__boost-toggle ${applyBoost ? "player-page__boost-toggle--on" : ""}`}
          onClick={() => setApplyBoost((v) => !v)}
        >
          {applyBoost ? "Points: with booster" : "Points: without booster"}
        </button>

        <button
          type="button"
          className={`player-page__boost-toggle ${stealMode ? "player-page__boost-toggle--on" : ""}`}
          onClick={() => setStealMode((v) => !v)}
        >
          {stealMode ? "Full player list" : "Steal of the Auction"}
        </button>

        <div className="player-page__nat">
          <button
            type="button"
            className={playerType === "ALL" ? "active" : ""}
            onClick={() => setPlayerType("ALL")}
          >
            All
          </button>
          <button
            type="button"
            className={playerType === "INDIAN" ? "active" : ""}
            onClick={() => setPlayerType("INDIAN")}
          >
            Indian
          </button>
          <button
            type="button"
            className={playerType === "OVERSEAS" ? "active" : ""}
            onClick={() => setPlayerType("OVERSEAS")}
          >
            Overseas
          </button>
        </div>

        <div className="player-page__cv-legend" aria-hidden>
          <span className="player-page__cv-legend-pill player-page__cv-legend-pill--captain">
            Captain
          </span>
          <span className="player-page__cv-legend-pill player-page__cv-legend-pill--vice">
            Vice-Captain
          </span>
        </div>
      </div>

      <div
        className={
          stealMode
            ? "player-page__tables"
            : groupByRole && isMobileRoleAccordion
              ? "player-page__tables player-page__tables--by-role-accordion"
              : groupByRole
                ? "player-page__tables player-page__tables--by-role"
                : "player-page__tables"
        }
      >
        {stealMode ? (
          <section className="player-page__card player-page__card--steal">
            <header className="player-page__steal-header">
              <h2 className="player-page__steal-title">Steal of the Auction</h2>
              <p className="player-page__steal-sub">
                Performance vs price — ranked by points per unit of auction price
                (same point totals as above, including booster toggle).
              </p>
            </header>
            {stealRanking.length === 0 ? (
              <p className="player-page__empty player-page__empty--inline">
                No players match the current filters.
              </p>
            ) : (
              renderStealTable()
            )}
            <p className="player-page__steal-foot">
              <strong>Value</strong> = points ÷ auction price. Missing or zero
              price uses a floor of 1 so the list stays sortable. Interpret
              “price” in whatever unit your league uses (the ratio is still
              comparable across players in the same auction). Unsold players are
              excluded.
            </p>
          </section>
        ) : groupByRole && isMobileRoleAccordion ? (
          <Collapse
            bordered={false}
            expandIconPosition="end"
            className="player-page__role-accordion"
            defaultActiveKey={ROLE_ORDER.filter((bucket) =>
              finalSorted.some((p) => roleBucket(p.role) === bucket)
            )}
            items={ROLE_ORDER.flatMap((bucket) => {
              const sub = finalSorted.filter(
                (p) => roleBucket(p.role) === bucket
              );
              if (!sub.length) return [];
              return [
                {
                  key: bucket,
                  label: (
                    <span className="player-page__role-accordion-label">
                      {roleSectionTitle(bucket)}
                    </span>
                  ),
                  children: (
                    <div className="player-page__role-accordion-panel">
                      {renderTable(sub)}
                    </div>
                  ),
                },
              ];
            })}
          />
        ) : groupByRole ? (
          ROLE_ORDER.map((bucket) => {
            const sub = finalSorted.filter(
              (p) => roleBucket(p.role) === bucket
            );
            if (!sub.length) return null;
            return (
              <section
                key={bucket}
                className="player-page__role-block player-page__card"
              >
                <h2 className="player-page__role-title">
                  {roleSectionTitle(bucket)}
                </h2>
                {renderTable(sub)}
              </section>
            );
          })
        ) : (
          <div className="player-page__card player-page__card--table">
            {renderTable(finalSorted)}
          </div>
        )}
      </div>
    </div>
  );
}
