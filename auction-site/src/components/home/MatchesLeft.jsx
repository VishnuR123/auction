import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
  Tooltip,
} from "recharts";

const OUTER_COLORS = ["#00b38a", "#f2ac42", "#ea324c"];

export default function MatchesLeft({
  matchesLeft,
  matchTotal,
  stages,
  innerColors,
}) {
  const left = Math.max(0, Number(matchesLeft) || 0);
  const total = Math.max(1, Number(matchTotal) || 74);
  const over = Math.max(0, total - left);

  const inner = [
    { name: "Played", value: over },
    { name: "Left", value: left },
  ];

  const outer = (stages || []).map((s) => ({
    name: s.label || s.key || "Stage",
    value: Number(s.count) || 0,
  }));

  if (!outer.length) {
    outer.push({ name: "Season", value: total });
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <PieChart>
        <Pie
          data={outer}
          cx="50%"
          cy="50%"
          startAngle={200}
          endAngle={-20}
          outerRadius={76}
          innerRadius={68}
        >
          {outer.map((_, index) => (
            <Cell
              key={`o-${index}`}
              fill={OUTER_COLORS[index % OUTER_COLORS.length]}
            />
          ))}
        </Pie>
        <Pie
          data={inner}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={66}
          startAngle={200}
          endAngle={-20}
          dataKey="value"
        >
          {inner.map((_, index) => (
            <Cell
              key={`i-${index}`}
              fill={innerColors[index % innerColors.length]}
            />
          ))}
          <Label
            value={left}
            position="center"
            style={{
              fontSize: 22,
              fontWeight: 700,
              fill: "var(--home-chart-label, #64748b)",
            }}
          />
        </Pie>
        <Tooltip />
        <Legend
          iconType="circle"
          layout="horizontal"
          verticalAlign="bottom"
          iconSize={10}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
