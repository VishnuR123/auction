import React from "react";
import './CVCPage.css'
function CVCPage({ players }) {
  // Function to group players by owner and captain status
  const groupPlayersByCVC = (filteredPlayers) => {
    const groupedPlayers = { captains: [], viceCaptains: [] };
    filteredPlayers.forEach((player) => {
      if (player.captainStatus === "captain") {
        groupedPlayers.captains.push(player);
      } else if (player.captainStatus === "vice-captain") {
        groupedPlayers.viceCaptains.push(player);
      }
    });
    return groupedPlayers;
  };

  // Filter players who are captains or vice-captains
  const captainsAndViceCaptains = players.filter(
    (player) =>
      player.captainStatus === "captain" ||
      player.captainStatus === "vice-captain"
  );

  // Group filtered players by owner and captain status
  const groupedCVC = groupPlayersByCVC(captainsAndViceCaptains);

  // Sort captains and vice-captains by total points in descending order
  const sortedCaptains = groupedCVC.captains.sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
  const sortedViceCaptains = groupedCVC.viceCaptains.sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  return (
    <div className="CVC-main">
      <div className="captain-cont container">
      <h2>Captains</h2>
      <table className="captain-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedCaptains.map((captain) => (
            <tr key={captain.name}>
              <td>{captain.name}</td>
              <td>{captain.owner}</td>
              <td>{captain.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>

      </div>
      <div className="captain-cont container">
        <h2>Vice-Captains</h2>
        <table className="vice-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedViceCaptains.map((viceCaptain) => (
              <tr key={viceCaptain.name}>
                <td>{viceCaptain.name}</td>
                <td>{viceCaptain.owner}</td>
                <td>{viceCaptain.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default CVCPage;
