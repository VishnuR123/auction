/**
 * Live dashboard: one shared chart height (from the Total Contribution pie layout model)
 * so OwnerGraph and TotalContribution stay aligned in the grid.
 */

export function computeLiveHomeChartHeight(teamCount) {
  const tc = Math.max(0, teamCount);
  const legendItems = 4 + tc;
  const legendRows = Math.ceil(legendItems / 5);
  const legendBlock = 20 + legendRows * 26;
  const outerRadius = Math.min(
    114,
    Math.max(54, Math.round(54 + Math.min(tc, 20) * 2.4))
  );
  const pieVertical = 2 * outerRadius + 42;
  return Math.min(
    560,
    Math.max(268, Math.round(pieVertical + legendBlock))
  );
}

/** Inner/outer radii + legend row height — derived from team count only. */
export function computePieRadiiAndLegendHeight(teamCount) {
  const tc = Math.max(0, teamCount);
  const legendItems = 4 + tc;
  const legendRows = Math.ceil(legendItems / 5);
  const outerRadius = Math.min(
    114,
    Math.max(54, Math.round(54 + Math.min(tc, 20) * 2.4))
  );
  const innerRadius = Math.round(outerRadius * 0.73);
  const innerPieOuter = Math.round(outerRadius * 0.65);
  const legendHeight = Math.min(40, 14 + legendRows * 22);
  return {
    innerPieOuter,
    outerRadius,
    innerRadius,
    legendHeight,
  };
}
