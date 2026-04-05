import React from "react";

import { parse, parseISO, format, isValid } from "date-fns";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
function OwnerGraph({ ownerPoints }) {
  // console.log('ownerPoints:', ownerPoints);
  // Reverse the order of ownerPoints documents
  const reversedOwnerPoints = [...ownerPoints].reverse();
  const latestOwnerPoints = reversedOwnerPoints.slice(-10);

  // Transform ownerPoints data
  const transformedData = latestOwnerPoints.map((doc) => {
    const date = new Date(doc.date).toLocaleDateString('en-US', {
      // weekday: 'long',
      // year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // .toLocaleDateString();
    const pointsData = { date };

    // Use Object.entries to iterate over the points object
    for (const [owner, points] of Object.entries(doc.points)) {
      pointsData[owner] = points;
    }

    return pointsData;
  });

  // Determine unique owners
  const owners = Array.from(
    new Set(ownerPoints.flatMap((doc) => Object.keys(doc.points)))
  );


  const ownerColors = {
    "Daddies Army": "#dc2a53",
    "LBW": "#ffd141",
    "Retro Boys": "#025b44",
    "Egoists": "#1046a9",
    "Chill 11": "#59bb81",
    "RCBangbros": "#5904a1",
    "Cumball": "#ffff00",
    "4th Stump": "#000000",
    "Nine 11": "#aa0000",
  };
  
  
  return (
    <>
      <h3>Points Progression</h3>
      <ResponsiveContainer
        width="100%"
        // height="100%"
        height={500}
      >
        <LineChart
          // width={500}
          // height={300}
          data={transformedData}
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} opacity={0.5} />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            style={{ fontSize: "12px" }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
            domain={['dataMin', 'dataMax']}  // Set the domain of the axis
            //  unit=" pts"
             allowDecimals={false}
          />
          <Tooltip />
          <Legend
            height={20}
            wrapperStyle={{
              margin: "0 0 10px 0",
            }}
          />
          {owners.map((owner) => (
            <Line
              key={owner}
              type="monotone"
              dataKey={owner}
              stroke={ownerColors[owner]}
              strokeWidth={1.5} 
              // activeDot={{ r: 8 }}
              // activeDot={<CustomActiveDot />}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

// const CustomToolTIp = ({ active, payload, label}) =>{
//   if(active && payload && payload.length){
//     return(
//       <div className="custom-tooltip">
//         <p>{label}</p>
//         <p></p>
//       </div>
//     );
//   }
// }

export default OwnerGraph;
