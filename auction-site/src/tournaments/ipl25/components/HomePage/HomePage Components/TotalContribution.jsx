import React from "react";
import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const TotalContribution = ({ players }) => {
  // Prepare data for role contribution
  const roleDataS = [
    {
      name: "BAT",
      value: players
        .filter((player) => player.role === "Batter")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    },
    {
      name: "BOWL",
      value: players
        .filter((player) => player.role === "Bowler")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    },
    {
      name: "AR",
      value: players
        .filter((player) => player.role === "Allrounder")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    },
    {
      name: "WK",
      value: players
        .filter((player) => player.role === "Wicketkeeper")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    }
  ];
  const roleData = roleDataS.sort((a, b) => b.value - a.value);
  // Prepare data for country contribution
  const teams = [...new Set(players.map((player) => player.team))];
  const teamDataS = teams.map((team) => ({
    name: team,
    value: players
      .filter((player) => player.team === team)
      .reduce((sum, player) => sum + player.totalPoints, 0),
  }));
  const teamData = teamDataS.sort((a, b) => b.value - a.value);
  const COLORS2 = {
    AR :"#ffd670",
    BAT : "#ff70a6",
    BOWL :  "#70d6ff",
    WK:"#70ffb0"
  };
  // const COLORS = {
  //   CSK: "#FECB00",
  //   MI: "#004BA0",
  //   RCB: "#DA1818",
  //   KKR: "#3A225D",
  //   RR: "#EA1A8E",
  //   GT: "#1C1C1C",
  //   LSG: "#00AEEF",
  //   PBKS: "#D71920",
  //   SRH: "#FF822A",
  //   DC: "#17449B",
  // };
  const COLORS = {
    CSK: "#FECB00",
    MI: "#004BA0",
    RCB: "#c00000",
    KKR: "#421c7b",
    RR: "#EA1A8E",
    GT: "#17004b",
    LSG: "#00e3ef",
    PBKS: "#D71920",
    SRH: "#FF822A",
    DC: "#17449B",
  };
  return (
    <>
      <h3>Total Contribution</h3>
      <ResponsiveContainer
        width="100%"
        // height="100%"
        height={355}
      >
        <PieChart
          margin={{
            top: 0,
            right: 20,
            left: 20,
            bottom: 30,
          }}
        >
          <Pie
                 
            data={roleData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={75}
            fill="#8884d8"
            // label
          >
            {roleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS2[entry.name]} />
            ))}
          </Pie>
          <Pie
            data={teamData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={115}
            fill="#82ca9d"
            label
          >
            {teamData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
               <Legend height={36}
          iconType="circle"
          layout="horizontal"
          horizantalAlign="middle"
          verticalAlign="bottom"
          iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default TotalContribution;
