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
        .filter((player) => player.role === "BAT")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    },
    {
      name: "BOWL",
      value: players
        .filter((player) => player.role === "BOWL")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    },
    {
      name: "AR",
      value: players
        .filter((player) => player.role === "AR")
        .reduce((sum, player) => sum + player.totalPoints, 0),
    },
  ];
  const roleData = roleDataS.sort((a, b) => b.value - a.value);
  // Prepare data for country contribution
  const countries = [...new Set(players.map((player) => player.country))];
  const countryDataS = countries.map((country) => ({
    name: country,
    value: players
      .filter((player) => player.country === country)
      .reduce((sum, player) => sum + player.totalPoints, 0),
  }));
  const countryData = countryDataS.sort((a, b) => b.value - a.value);
  const COLORS2 = {
    AR: "#70d6ff",
    BAT: "#ff70a6",
    BOWL: "#ffd670",
  };
  const COLORS = {
    IRE: "#31742d",
    USA: "#002868",
    SA: "#065233",
    BAN: "#013F2F",
    SL: "#0b2772",
    NED: "#F3622B",
    WI: "#660028",
    NZ: "#12AAB6",
    AFG: "#0854cc",
    AUS: "#F5EE23",
    ENG: "#f32f29",
    IND: "#0983e7",
    PAK: "#0F2C2E",
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
            data={countryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={115}
            fill="#82ca9d"
            label
          >
            {countryData.map((entry, index) => (
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
