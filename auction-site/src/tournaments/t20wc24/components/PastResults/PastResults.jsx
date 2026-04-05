import "./PastResults.css";
// Data for the tournaments
const ipl24Results = [
  { name: "Subu", points: 9267 },
  { name: "Vishnu", points: 9120 },
  { name: "Shriman", points: 8950.5 },
  { name: "Yukesh", points: 8755 },
  { name: "Shashwat", points: 7852.5 },
  { name: "Saran", points: 7538.5 },
  { name: "Sanjay", points: 6859 },
  { name: "Sathish", points: 6212 },
  { name: "Sakthi", points: 10 },
];

const wc23Results = [
  { name: "Subu", points: 6750 },
  { name: "Yukesh", points: 6709 },
  { name: "Shriman", points: 6537 },
  { name: "Vishnu", points: 5948 },
  { name: "Sakthi", points: 5839 },
  { name: "Sanjay", points: 5821 },
  { name: "Sathish", points: 5590 },
  { name: "Shashwat", points: 5450 },
  { name: "Saran", points: 5172 },
];

const ipl23Results = [
  { name: "Yukesh", points: 10713 },
  { name: "Sanjay", points: 7627 },
  { name: "Vishnu", points: 7541 },
  { name: "Shashwat", points: 6921 },
  { name: "Sathish", points: 6783 },
  { name: "Shriman", points: 5909 },
  { name: "Subu", points: 5885 },
  { name: "Sakthi", points: 5116 },
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
  if (totals['Yukesh']) {
    totals['Yukesh'] -= 6709;
  }
  return totals;
}

const totalPoints = calculateTotalPoints(ipl24Results, wc23Results, ipl23Results);
// Transform totalPoints object into an array
const totalPointsArray = Object.entries(totalPoints).map(([name, points]) => ({ name, points }));

// Sort the array
const sortedTotalPoints = sortResults(totalPointsArray);
// React component
const PastResults = () => {
  return (
    <div className="past-res-main">
      <div className="ipl-24 container">
        <h2>IPL-24 Results</h2>
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
      <div className="wc-23 container">
        <h2>WC-23 Results</h2>
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
      <div className="ipl-23 container">
        <h2>IPL-23 Results</h2>
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
      <div className="total-results container">
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
    </div>
  );
};

export default PastResults;
