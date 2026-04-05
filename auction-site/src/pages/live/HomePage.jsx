import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Alert } from "antd";
import { useHomeDashboard } from "../../hooks/useHomeDashboard.js";
import { useResolvedTournament } from "../../hooks/useResolvedTournament.js";
import { useThemeMode } from "../../context/useThemeMode.js";
import TodayTable from "../../components/home/TodayTable.jsx";
import OwnerGraph from "../../components/home/OwnerGraph.jsx";
import HighestContributor from "../../components/home/HighestContributor.jsx";
import TotalContribution from "../../components/home/TotalContribution.jsx";
import MatchesLeft from "../../components/home/MatchesLeft.jsx";
import HomeBlobs from "../../components/home/HomeBlobs.jsx";
import { computeLiveHomeChartHeight } from "../../components/home/liveHomeChartHeight.js";
import OwnerLogoImg from "../../components/owner/OwnerLogoImg.jsx";
import "../../styles/home.css";

export default function HomePage() {
  const { tournamentId } = useParams();
  const { theme } = useResolvedTournament(tournamentId);
  const { isDark } = useThemeMode();
  const { data, loading, error } = useHomeDashboard(tournamentId);
  const [hoveredOwnerId, setHoveredOwnerId] = useState(null);

  const innerPieColors = useMemo(() => {
    if (isDark) {
      return ["#94a3b8", "#e2e8f0"];
    }
    return [theme.primaryColor, "#cbd5e1"];
  }, [isDark, theme.primaryColor]);

  /** Light: secondary blobs on primary card; dark: primary blobs on standard dark card surface. */
  const blobFill = isDark ? theme.primaryColor : theme.secondaryColor;

  /** Same height for both charts — derived from Total Contribution (team count → pie + legend). */
  const liveChartHeight = useMemo(() => {
    if (!data?.players?.length) return computeLiveHomeChartHeight(0);
    const teamCount = new Set(
      data.players.map((p) => p.teamCode || p.team).filter(Boolean)
    ).size;
    return computeLiveHomeChartHeight(teamCount);
  }, [data?.players]);

  if (loading) {
    return (
      <div className="home-loading">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Could not load dashboard" description={error} showIcon />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="live-home">
      <div className="home-grid">
        <div className="main-table  home-card">
          {data.leaderboard.length > 0 ? (
            <div className="points-table">
              <div className="table-header">
                <span className="team-header">Team</span>
                <span className="points-header">Pts</span>
                <span className="difference-header">Df</span>
                <span className="movement-header">Mv</span>
              </div>
              <div className="table-body">
                {data.leaderboard.map((row) => (
                  <div className="table-row" key={row.ownerId}>
                    <div className="team-column">
                      <OwnerLogoImg
                        ownerId={row.ownerId}
                        shortName={row.shortName}
                        alt=""
                        className="team-owner-logo"
                        imgProps={{ "aria-hidden": true }}
                      />
                      <span className="team-name">{row.name}</span>
                    </div>
                    <span className="points-column">{row.total.toFixed(2)}</span>
                    <span className="difference-column">
                      {row.difference != null ? row.difference.toFixed(2) : "—"}
                    </span>
                    <span
                      className={`movement-column ${
                        row.positionChange == null
                          ? "movement-column--na"
                          : row.positionChange > 0
                            ? "movement-column--up"
                            : row.positionChange < 0
                              ? "movement-column--down"
                              : "movement-column--same"
                      }`}
                      aria-label={
                        row.positionChange == null
                          ? "Movement not available"
                          : row.positionChange === 0
                            ? "No change in rank"
                            : row.positionChange > 0
                              ? `Up ${row.positionChange} places`
                              : `Down ${Math.abs(row.positionChange)} places`
                      }
                    >
                      {row.positionChange == null
                        ? "—"
                        : row.positionChange === 0
                          ? "—"
                          : row.positionChange > 0
                            ? `↑${row.positionChange}`
                            : `↓${Math.abs(row.positionChange)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="home-waiting">No owners yet</p>
          )}
        </div>

        <div className="today-table  home-card">
          <TodayTable
            rows={data.todayPointsMeta}
            onOwnerHover={setHoveredOwnerId}
          />
        </div>

        <div
          className={`main-contributor  home-card home-main-contributor ${
            isDark ? "home-main-contributor--dark" : "home-main-contributor--light"
          }`}
        >
          <div className="home-blob-stack" aria-hidden>
            <HomeBlobs fill={blobFill} />
          </div>
          <div className="home-main-contributor__inner">
            <HighestContributor
              hoveredOwnerId={hoveredOwnerId}
              players={data.players}
              matchNumbers={data.matchNumbers}
            />
          </div>
        </div>

        <div className="matches-left  home-card">
          <h3 className="home-section-title home-matches-left-title">
            Matches Left
          </h3>
          <MatchesLeft
            matchesLeft={data.matchesLeft}
            matchTotal={data.matchTotal}
            stages={data.stages}
            innerColors={innerPieColors}
          />
        </div>
      </div>

      <div className="home-grid2">
        <div className="graph-1  home-card">
          <OwnerGraph
            graphData={data.graphData}
            graphOwners={data.graphOwners}
            ownerColors={data.ownerColors}
            chartHeight={liveChartHeight}
          />
        </div>
        <div className="total-contribution  home-card">
          <TotalContribution
            players={data.players}
            chartHeight={liveChartHeight}
          />
        </div>
      </div>
    </div>
  );
}
