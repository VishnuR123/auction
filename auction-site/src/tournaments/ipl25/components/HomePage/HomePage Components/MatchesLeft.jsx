import React from "react";
import { Tooltip,ResponsiveContainer, PieChart, Pie, Cell,Legend,Label } from "recharts";
import "../HomePage.css";
function MatchesLeft({ matchesLeft }) {
  const totalMatches = 74;
  const matchesOver = totalMatches - matchesLeft;
  const progress = (matchesOver / totalMatches) * 100;
  const data = [
    { name: "Matches Over", value: matchesOver },
    { name: "Matches Left", value: matchesLeft },
  ];
  const COLORS = [  "#ff0088" ,"#10044a"];
  const dataouter=[
    {name:"League Stage",value: 35},
    {name:"Half way",value: 35},
    {name:"Playoffs",value: 4},
    ];
  const COLORSouter = ["#00b38a","#f2ac42","#ea324c"];
  if (matchesLeft) {
    const data01 = [
      { name: "Total Matches", value: "74" },
      { name: "Matches Left", value: matchesLeft },
    ];
  }
  const renderColorfulLegendText = (value, entry) => {
    return (
      <span style={{ color: "#596579", fontWeight: 500, padding: "10px" }}>
        {value}
      </span>
    );
  };

 
  return (
    <>


      <ResponsiveContainer width="100%"  height="80%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            fill="#8884d8"
            data={dataouter}
            startAngle={200} 
            endAngle={-20}
            outerRadius={90}
            innerRadius={81}
            >
              {dataouter.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORSouter[index % COLORSouter.length]}
              />
            ))}
              
            </Pie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={0}
            // startAngle={90}
            // endAngle={-270}
            startAngle={200}
            endAngle={-20}
            dataKey="value"
            // label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            <Label
              value={data[1].value}
              position="center"
              fill="grey"
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                fontFamily: "Roboto",
              }}
            />
          </Pie>
            <Tooltip />
          <Legend 
          // height={36}
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
}

export default MatchesLeft;
