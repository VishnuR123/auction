import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./homeWidgets.css";
import { computePieRadiiAndLegendHeight } from "./liveHomeChartHeight.js";

const ROLE_COLORS = {
  AR: "#ffd670",
  BAT: "#ff70a6",
  BOWL: "#70d6ff",
  WK: "#70ffb0",
};

const TEAM_FALLBACK = [
  "#FECB00",
  "#004BA0",
  "#c00000",
  "#421c7b",
  "#EA1A8E",
  "#17004b",
  "#00e3ef",
  "#D71920",
  "#FF822A",
  "#17449B",
];

const DEFAULT_HEIGHT = 350;
const DEFAULT_INNER_PIE_OUTER = 62;
const DEFAULT_OUTER_R = 96;
const DEFAULT_INNER_R = 70;

function normalizeRole(role) {
  const r = String(role || "").toLowerCase();
  if (r.includes("all")) return "AR";
  if (r.includes("bat")) return "BAT";
  if (r.includes("bowl")) return "BOWL";
  if (r.includes("wick") || r === "wk") return "WK";
  return "BAT";
}

export default function TotalContribution({ players, chartHeight }) {
  const roleDataS = [
    {
      name: "BAT",
      value: players
        .filter((p) => normalizeRole(p.role) === "BAT")
        .reduce((s, p) => s + (Number(p.totalPoints) || 0), 0),
    },
    {
      name: "BOWL",
      value: players
        .filter((p) => normalizeRole(p.role) === "BOWL")
        .reduce((s, p) => s + (Number(p.totalPoints) || 0), 0),
    },
    {
      name: "AR",
      value: players
        .filter((p) => normalizeRole(p.role) === "AR")
        .reduce((s, p) => s + (Number(p.totalPoints) || 0), 0),
    },
    {
      name: "WK",
      value: players
        .filter((p) => normalizeRole(p.role) === "WK")
        .reduce((s, p) => s + (Number(p.totalPoints) || 0), 0),
    },
  ];
  const roleData = roleDataS.sort((a, b) => b.value - a.value);

  const teams = [...new Set(players.map((p) => p.teamCode || p.team).filter(Boolean))];
  const teamDataS = teams.map((team) => ({
    name: team,
    value: players
      .filter((p) => (p.teamCode || p.team) === team)
      .reduce((s, p) => s + (Number(p.totalPoints) || 0), 0),
  }));
  const teamData = teamDataS.sort((a, b) => b.value - a.value);

  const layout = useMemo(() => {
    const h = chartHeight ?? DEFAULT_HEIGHT;
    if (chartHeight == null) {
      return {
        chartHeight: h,
        innerPieOuter: DEFAULT_INNER_PIE_OUTER,
        outerRadius: DEFAULT_OUTER_R,
        innerRadius: DEFAULT_INNER_R,
        legendHeight: 28,
      };
    }
    const r = computePieRadiiAndLegendHeight(teamData.length);
    return { chartHeight: h, ...r };
  }, [chartHeight, teamData.length]);

  return (
    <>
      <h3 className="home-section-title">Total Contribution</h3>
      <ResponsiveContainer width="100%" height={layout.chartHeight}>
        <PieChart margin={{ top: 0, right: 16, left: 16, bottom: 24 }}>
          <Pie
            data={roleData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={layout.innerPieOuter}
          >
            {roleData.map((entry, index) => (
              <Cell key={`r-${index}`} fill={ROLE_COLORS[entry.name] ?? "#94a3b8"} />
            ))}
          </Pie>
          <Pie
            data={teamData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={layout.innerRadius}
            outerRadius={layout.outerRadius}
            label
          >
            {teamData.map((entry, index) => (
              <Cell
                key={`t-${index}`}
                fill={TEAM_FALLBACK[index % TEAM_FALLBACK.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            height={layout.legendHeight}
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}
