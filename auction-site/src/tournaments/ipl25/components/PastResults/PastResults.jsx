import './PastResults.css';
// Data for the tournaments
const ipl23Results = [
  { name: "Cumball", points: 10713 },
  { name: "Retro Boys", points: 7627 },
  { name: "Nine 11", points: 7541 },
  { name: "Chill 11", points: 6921 },
  { name: "LBW", points: 6783 },
  { name: "RCBangbros", points: 5909 },
  { name: "4th Stump", points: 5885 },
  { name: "Daddies Army", points: 5116 },
  { name: "Egoists", points: 10 },
];

const wc23Results = [
  { name: "4th Stump", points: 6750 },
  { name: "Cumball", points: 6709 },
  { name: "RCBangbros", points: 6537 },
  { name: "Nine 11", points: 5948 },
  { name: "Daddies Army", points: 5839 },
  { name: "Retro Boys", points: 5821 },
  { name: "LBW", points: 5590 },
  { name: "Chill 11", points: 5450 },
  { name: "Egoists", points: 5172 },
];
const ipl24Results = [
  { name: "4th Stump", points: 9267 },
  { name: "Nine 11", points: 9120 },
  { name: "RCBangbros", points: 8950.5 },
  { name: "Cumball", points: 8755 },
  { name: "Chill 11", points: 7852.5 },
  { name: "Egoists", points: 7538.5 },
  { name: "Retro Boys", points: 6859 },
  { name: "LBW", points: 6212 },
  { name: "Daddies Army", points: 10 },
];

const t20wc24Results = [
  { name: "Chill 11", points: 3754.01 },
  { name: "4th Stump", points: 3382.75 },
  { name: "Daddies Army", points: 3365.74 },
  { name: "RCBangbros", points: 3256.36 },
  { name: "Retro Boys", points: 3151.04 },
  { name: "Cumball", points: 3005.75 },
  { name: "LBW", points: 2972.75 },
  { name: "Nine 11", points: 2958.5 },
  { name: "Egoists", points: 2497.75 },
];

const ct25Results = [
  { name: "4th Stump", points: 2940.25 },
  { name: "Nine 11", points: 2877.75 },
  { name: "Chill 11", points: 2734.5 },
  { name: "Cumball", points: 2346.5 },
  { name: "RCBangbros", points: 2333.5 },
  { name: "Daddies Army", points: 2222.5 },
  { name: "Retro Boys", points: 1998 },
  { name: "LBW", points: 1490.25 },
  { name: "Egoists", points: 10 },
];

// Function to sort the results in descending order based on points
const sortResults = (results) => {
  return results.sort((a, b) => b.points - a.points);
};

function calculateTotalPoints(...results) {
  const totals = {};

  results.forEach(resultSet => {
    resultSet.forEach(result => {
      const { name, points } = result;
      if (!totals[name]) {
        totals[name] = 0;
      }
      totals[name] += points;
    });
  });
  if (totals['Cumball']) {
    totals['Cumball'] -= 6709;
  }

  // Round all points to 2 decimal places
  Object.keys(totals).forEach(name => {
    totals[name] = parseFloat(totals[name].toFixed(2));
  });

  return totals;
}

const totalPoints = calculateTotalPoints(ipl24Results, wc23Results, ipl23Results, t20wc24Results, ct25Results);
// Transform totalPoints object into an array
const totalPointsArray = Object.entries(totalPoints).map(([name, points]) => ({ name, points }));

// Sort the array
const sortedTotalPoints = sortResults(totalPointsArray);
// React component
const PastResults = () => {
  return (
    <div className="ipl25-past-res-main">
      {/* Total Points Table on the Left */}
      <div className="total-results ipl25-past-res__card">
        <h2>Cumulative Results</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedTotalPoints.map((player) => (
              <tr key={player.name}>
                <td>{player.name}</td>
                <td>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tournament Tables on the Right */}
      <div className="tournament-results">
        {/* International Tournaments */}
        <div className="international-tournaments">
        <div className="ipl25-past-res__card ipl25-past-res__card--empty"></div>
          <div className="wc-23 ipl25-past-res__card">
            <h2>WC 23 Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {sortResults(wc23Results).map((player) => (
                  <tr key={player.name}>
                    <td>{player.name}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="t20wc-24 ipl25-past-res__card">
            <h2>T20WC 24 Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {sortResults(t20wc24Results).map((player) => (
                  <tr key={player.name}>
                    <td>{player.name}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ct25 ipl25-past-res__card">
            <h2>CT 25 Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {sortResults(ct25Results).map((player) => (
                  <tr key={player.name}>
                    <td>{player.name}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IPL Tournaments */}
        <div className="ipl-tournaments">
          <div className="ipl-23 ipl25-past-res__card">
            <h2>IPL 23 Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {sortResults(ipl23Results).map((player) => (
                  <tr key={player.name}>
                    <td>{player.name}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ipl-24 ipl25-past-res__card">
            <h2>IPL 24 Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {sortResults(ipl24Results).map((player) => (
                  <tr key={player.name}>
                    <td>{player.name}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ipl25-past-res__card ipl25-past-res__card--empty"></div>
          <div className="ipl25-past-res__card ipl25-past-res__card--empty"></div>
        </div>
      </div>
    </div>
  );
};

export default PastResults;
