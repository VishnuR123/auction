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
import "./homeWidgets.css";

const DEFAULT_CHART_HEIGHT = 350;

export default function OwnerGraph({
  graphData,
  graphOwners,
  ownerColors,
  chartHeight = DEFAULT_CHART_HEIGHT,
}) {
  if (!graphData?.length || !graphOwners?.length) {
    return <p className="home-waiting">Not enough history for a chart</p>;
  }

  return (
    <>
      <h3 className="home-section-title">Points Progression</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={graphData}
          margin={{ top: 10, right: 25, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} opacity={0.5} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            style={{ fontSize: 12 }}
          />
          <YAxis
            style={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
            domain={["dataMin", "dataMax"]}
            allowDecimals={false}
          />
          <Tooltip />
          <Legend
            height={20}
            wrapperStyle={{ margin: "0 0 10px 0" }}
          />
          {graphOwners.map((owner) => (
            <Line
              key={owner}
              type="monotone"
              dataKey={owner}
              stroke={ownerColors[owner] ?? "#64748b"}
              strokeWidth={1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
