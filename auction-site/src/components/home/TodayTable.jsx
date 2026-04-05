import "./homeWidgets.css";

/** @param {{ rows: { ownerId: string, shortName: string, points: number, primaryColor?: string, secondaryColor?: string }[], onOwnerHover: (id: string | null) => void }} props */
export default function TodayTable({ rows, onOwnerHover }) {
  if (!rows?.length) {
    return <div className="home-waiting">No match points yet</div>;
  }

  return (
    <div className="points-table2">
      <div className="table-header today-points-header">
        <span className="today-points-header__label">Today points</span>
      </div>
      <div className="table-body">
        {rows.map(
          ({ ownerId, shortName, points, primaryColor, secondaryColor }) => {
            const bg = primaryColor || "#64748b";
            const fg = secondaryColor || "#ffffff";
            return (
            <div
              className={`table-row home-today-row home-today-row--owner-colored ${shortName.replace(/\s+/g, "-").replace(/^\d/, "_$&")}`}
              key={ownerId}
              style={{
                // CSS vars survive where plain background/color on the same element fought theme .table-row rules
                "--owner-bg": bg,
                "--owner-fg": fg,
              }}
              onMouseEnter={() => onOwnerHover?.(ownerId)}
              onMouseLeave={() => onOwnerHover?.(null)}
            >
              <div className="team-column">
                <span className="team-name">{shortName}</span>
              </div>
              <span className="points-column">{points.toFixed(2)}</span>
            </div>
            );
          }
        )}
      </div>
    </div>
  );
}
