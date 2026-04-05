import { useState } from "react";
import "./OwnerPage.css";
import EgoistsLogo from "../../assets/logo/Egoists.svg";
import LBWLogo from "../../assets/logo/LBW.svg";
import RetroBoysLogo from "../../assets/logo/Retro Boys.svg";
import FourthStumpLogo from "../../assets/logo/4th Stump.svg";
import Nine11Logo from "../../assets/logo/Nine 11.svg";
import DaddiesArmyLogo from "../../assets/logo/Daddies Army.svg";
import CumballLogo from "../../assets/logo/Cumball.svg";
import Chill11Logo from "../../assets/logo/Chill 11.svg";
import RCBLogo from "../../assets/logo/RCB.svg";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const ownerColors = {
  Egoists: {
    logo: EgoistsLogo,
    background: "#1046a9",
    text: "#000",
  },
  LBW: {
    logo: LBWLogo,
    background: "#005aa9",
    text: "#000",
  },
  "Retro Boys": {
    logo: RetroBoysLogo,
    background: "#025b44",
    text: "#000",
  },
  "4th Stump": {
    logo: FourthStumpLogo,
    background: "#000",
    text: "#000",
  },
  "Nine 11": {
    logo: Nine11Logo,
    background: "#aa0000",
    text: "#000",
  },
  "Daddies Army": {
    logo: DaddiesArmyLogo,
    background: "#001b73",
    text: "#000",
  },
  Cumball: {
    logo: CumballLogo,
    background: "#ffff00",
    text: "#000",
  },
  "Chill 11": {
    logo: Chill11Logo,
    background: "#0f2c2e",
    text: "#000",
  },
  RCBangbros: {
    logo: RCBLogo,
    background: "#5904a1",
    text: "#000",
  },
};

function OwnerPage({ players, ownerPoints }) {
  const [selectedOwner, setSelectedOwner] = useState("");
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  const handleOwnerSelect = (owner) => {
    setSelectedOwner(owner);
  };

  const filteredPlayers = players
    .filter((player) => player.owner === selectedOwner)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const rolePoints = filteredPlayers.reduce((acc, player) => {
    if (!acc[player.role]) {
      acc[player.role] = 0;
    }
    acc[player.role] += player.totalPoints;
    return acc;
  }, {});

  const data = Object.keys(rolePoints).map((role) => ({
    name: role,
    value: rolePoints[role],
  }));

  const latestOwnerPoints = ownerPoints[0]?.points[selectedOwner] || 0;

  const countryPoints = filteredPlayers.reduce((acc, player) => {
    if (!acc[player.team]) {
      acc[player.team] = 0;
    }
    acc[player.team] += player.totalPoints;
    return acc;
  }, {});

  const radarData = Object.keys(countryPoints).map((team) => ({
    team,
    points: countryPoints[team],
  }));

  const ownerStyle = selectedOwner
    ? {
        backgroundColor: ownerColors[selectedOwner]?.background || "#fff",
        color: ownerColors[selectedOwner]?.text || "#000",
      }
    : {};

  return (
    <div className="owner-main" style={ownerStyle}>
      <div className="owner-logo-row">
        {Object.keys(ownerColors).map((owner) => (
          <div
            key={owner}
            className={`owner-logo ${owner.replace(/\s+/g, "-")}`}
            onClick={() => handleOwnerSelect(owner)}
          >
            <img
              src={ownerColors[owner].logo}
              alt={owner}
              className="owner-logo-img"
            />
          </div>
        ))}
      </div>

      <div className="owner-parent">
        <div className="players-list owner-container">
          {selectedOwner && (
            <>
              <h3>{selectedOwner}'s Players</h3>
              <ul>
                {filteredPlayers.map((player) => (
                  <li
                    key={player.name}
                    onMouseEnter={() => setHoveredPlayer(player)}
                    onMouseLeave={() => setHoveredPlayer(null)}
                  >
                    <span>{player.name}</span>
                    <span> {player.totalPoints} points</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="country-radar owner-container">
          <h3>Points Contribution by Team</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="77%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="team" />
              <PolarRadiusAxis
                angle={30}
                domain={[0, Math.max(...radarData.map((d) => d.points))]}
              />
              <Radar
                name="Points"
                dataKey="points"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="role-pie owner-container">
          <h3>Points Contribution by Role</h3>
          <ResponsiveContainer height={150}>
            <PieChart height={150}>
              <Pie
                data={data}
                cx="50%"
                cy="75%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                label
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <Label
                  value={latestOwnerPoints}
                  position="center"
                  fill="grey"
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    fontFamily: "Roboto",
                  }}
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="individual-points owner-container">
          {hoveredPlayer ? (
            <>
              <h2>{hoveredPlayer.name}'s Match Points</h2>
              <ul>
                {hoveredPlayer.points.map((match, index) => (
                  <li key={index}>
                    Match {match.matchNumber} : {match.points} points
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="alert">Hover over your players</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerPage;
