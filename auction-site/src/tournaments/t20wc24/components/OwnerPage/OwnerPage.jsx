import { useState } from "react";
import "./OwnerPage.css";
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
function OwnerPage({ players, ownerPoints }) {
  const [selectedOwner, setSelectedOwner] = useState("");
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  const handleOwnerChange = (event) => {
    setSelectedOwner(event.target.value);
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
    if (!acc[player.country]) {
      acc[player.country] = 0;
    }
    acc[player.country] += player.totalPoints;
    return acc;
  }, {});

  const radarData = Object.keys(countryPoints).map((country) => ({
    country,
    points: countryPoints[country],
  }));
  return (
    <div className="owner-main">
      <div className="owner-form owner-container">
        <select id="owner-select" className='owner-select' onChange={handleOwnerChange}>
          <option value="">--Select an Owner--</option>
          <option value="Sakthi">Sakthi</option>
          <option value="Sathish">Sathish</option>
          <option value="Sanjay">Sanjay</option>
          <option value="Saran">Saran</option>
          <option value="Shashwat">Shashwat</option>
          <option value="Shriman">Shriman</option>
          <option value="Yukesh">Yukesh</option>
          <option value="Subu">Subu</option>
          <option value="Vishnu">Vishnu</option>
        </select>
        <label htmlFor="owner-select">Page</label>
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
                    <span>{player.name}</span><span> {player.totalPoints} points</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="country-radar owner-container">
          <h3>Points Contribution by Country</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="77%" data={radarData}>
              {/* <defs>
                <linearGradient id='color' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset="40%" stopColor="#00C49F" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.05}/>
                </linearGradient>
              </defs> */}
              <PolarGrid />
              <PolarAngleAxis dataKey="country" />
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
