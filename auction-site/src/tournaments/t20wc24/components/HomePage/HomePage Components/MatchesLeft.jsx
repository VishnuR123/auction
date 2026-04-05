import React from "react";
import { Tooltip,ResponsiveContainer, PieChart, Pie, Cell,Legend,Label } from "recharts";

function MatchesLeft({ matchesLeft }) {
  const totalMatches = 55;
  const matchesOver = totalMatches - matchesLeft;
  const progress = (matchesOver / totalMatches) * 100;
  const data = [
    { name: "Matches Over", value: matchesOver },
    { name: "Matches Left", value: matchesLeft },
  ];
  const COLORS = [  "#ff0088" ,"#10044a"];
  const dataouter=[
    {name:"League Stage",value: 40},
    {name:"Super 8",value: 12},
    {name:"Knockout",value: 3},
    ];
  const COLORSouter = ["#00b38a","#f2ac42","#ea324c"];
  if (matchesLeft) {
    const data01 = [
      { name: "Total Matches", value: "55" },
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
      <h3>Matches Left</h3>
      <ResponsiveContainer width="100%" height={200}>
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
          {/* <Legend height={36}
          iconType="circle"
          layout="horizontal"
          horizantalAlign="middle"
          verticalAlign="bottom"
          iconSize={10}
          /> */}
        </PieChart>
      </ResponsiveContainer>

      {/* <div class="circle-wrap">
        <div class="circle">
          <div class="mask full">
            <div class="fill"></div>
          </div>

          <div class="mask half">
            <div class="fill"></div>
          </div>

          <div class="inside-circle">70%</div>
        </div>
      </div> */}
    </>
  );
}

export default MatchesLeft;
