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
} from "recharts";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const ownerLogos = {
  'Egoists': {
    logo: EgoistsLogo,
    background: "#3e2266",
    text: "#fff",
  },
  'LBW': {
    logo: LBWLogo,
    background: "#005da0",
    text: "#fff",
  },
  'Retro Boys': {
    logo: RetroBoysLogo,
    background: "#d50000",
    text: "#fff",
  },
  '4th Stump': {
    logo: FourthStumpLogo,
    background: "#e40046",
    text: "#fff",
  },
  'Nine 11': {
    logo: Nine11Logo,
    background: "#f05a28",
    text: "#fff",
  },
  'Daddies Army': {
    logo: DaddiesArmyLogo,
    background: "#f9d423",
    text: "#333",
  },
  'Cumball': {
    logo: CumballLogo,
    background: "#00a859",
    text: "#fff",
  },
  'Chill 11': {
    logo: Chill11Logo,
    background: "#ea1c8b",
    text: "#fff",
  },
  'RCBangbros': {
    logo: RCBLogo,
    background: "#1c1c1c",
    text: "#fff",
  },
};
function OwnerPage({ players, ownerPoints }) {
  const [selectedOwner, setSelectedOwner] = useState("");
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  // const handleOwnerChange = (event) => {
  //   setSelectedOwner(event.target.value);
  // };
  const handleOwnerChange = (owner) => {
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

  // Get the latest document's points for the selected owner
  const latestOwnerPoints = ownerPoints[0]?.points[selectedOwner] || 0;

  // Group points by country
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
  
  return (
    <div className="owner-main">
      {/* Row of Logos */}
      <div className="owner-logo-row">
        {Object.keys(ownerLogos).map((owner) => (
          <div
            key={owner}
            className={`owner-logo ${owner.replace(/\s+/g, "-")}`}
            onClick={() => handleOwnerSelect(owner)}
          >
            <img
              src={ownerLogos[owner].logo}
              alt={owner}
              className="owner-logo-img"
            />
            {/* <span>{owner}</span> */}
          </div>
        ))}
      </div>
      {/* <div className="owner-form owner-container">
        <select id="owner-select" className='owner-select' onChange={handleOwnerChange}>
          <option value="">--Select an Owner--</option>
          <option value="Daddies Army">Daddies Army</option>
          <option value="LBW">Legends Being Wasted</option>
          <option value="Retro Boys">Retro Boys</option>
          <option value="Egoists">Egoists</option>
          <option value="Chill 11">Chill 11</option>
          <option value="RCBangbros">Royal Challengers Bangbros</option>
          <option value="Cumball">Cumball</option>
          <option value="4th Stump">4th Stump</option>
          <option value="Nine 11">Nine 11</option>
        </select>
        <label htmlFor="owner-select">Page</label>
      </div> */}
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
                    <span>{player.name}</span><span> {player.totalPoints} points</span>
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
              {/* <defs>
                <linearGradient id='color' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset="40%" stopColor="#00C49F" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.05}/>
                </linearGradient>
              </defs> */}
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
                // fill="url(#color)"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
          <div className="role-pie owner-container">
            <h3>Points Contribution by Role</h3>
            <ResponsiveContainer 
            height={150}
            >
              <PieChart 
              height={150}
              >
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
            ):
            (
            <div className="alert"> 
              Hover over your players
            </div>)
            }
              
            
          </div>
 
      </div>
     </div>
  );
}

export default OwnerPage;
