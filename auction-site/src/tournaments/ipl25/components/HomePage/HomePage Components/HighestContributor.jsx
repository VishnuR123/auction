// import React, { useEffect, useState } from "react";
// import "./HighestContributor.css";

// const HighestContributor = ({ owner, ownerPoints, players }) => {
//   const [highestContributor, setHighestContributor] = useState(null);
//   const [highestPoints, setHighestPoints] = useState(0);
//   const [matchNumbers, setMatchNumbers] = useState([]);

//   useEffect(() => {
//     const mostRecent = ownerPoints[0];
//     const previousDayMostRecent = ownerPoints.find((doc) => {
//       const docDate = new Date(doc.date);
//       // console.log("curr doc date")
//       // console.log(docDate)
//       const mostRecentDate = new Date(mostRecent.date);
//       // console.log("most recent date")
//       // console.log(mostRecentDate)
//       return (
//         docDate.getFullYear() === mostRecentDate.getFullYear() &&
//         docDate.getMonth() === mostRecentDate.getMonth() &&
//         docDate.getDate() < mostRecentDate.getDate()
//       );
//     });

//     if (previousDayMostRecent) {
//       const matchNumbersS = ownerPoints
//         .filter(
//           (doc) => new Date(doc.date) > new Date(previousDayMostRecent.date)
//         )
//         .map((doc) => doc.matchNumber);
//       console.log(matchNumbersS);
//       setMatchNumbers(matchNumbersS);
//     }
//   }, [ownerPoints]);
//   useEffect(() => {
//     if (owner) {
//       const ownerPlayers = players.filter((player) => player.owner === owner);

//       let highestContributor = null;
//       let highestPointsQ = 0;

//       ownerPlayers.forEach((player) => {
//         const totalPoints = player.points
//           .filter((match) => {
//             // console.log("Match Number:", match.matchNumber);
//             // matchNumbers.includes(match.matchNumber);
//             const matchNumber = parseInt(match.matchNumber, 10);
//             const isInMatchNumbers = matchNumbers
//               .map((num) => parseInt(num, 10))
//               .includes(matchNumber);
//             // Debugging: Print each match's matchNumber and check inclusion
//             // console.log(
//             //   `Match Number: ${matchNumber}, Is Included: ${isInMatchNumbers}`
//             // );
//             return isInMatchNumbers;
//           })
//           .reduce((sum, match) => sum + match.points, 0);

//         if (totalPoints > highestPointsQ) {
//           highestPointsQ = totalPoints;
//           highestContributor = player;
//         }
//       });
//       if (highestContributor) {
//         setHighestContributor(highestContributor);
//         setHighestPoints(highestPointsQ);
//       } else {
//         setHighestContributor(null);
//         setHighestPoints(null);
//       }
//     } else {
//       setHighestContributor(null);
//       setHighestPoints(null);
//     }
//   }, [owner, players]);

//   return (
//     <> 
//       {highestContributor ? (
//         <>
//           {/* <img
//             alt=""
//             className={`flag-tag ${highestContributor.team}`}
//           /> */}
         
//           <h3>Highest Contributor {highestContributor.name}</h3>
//           <p className="points">Points: {highestPoints}</p>
//         </>
//       ) : (
//         <p>Hover over your name</p>
//       )}
//     </>
//   );
// };

// export default HighestContributor;
import React, { useEffect, useState } from "react";
import "./HighestContributor.css";

const HighestContributor = ({ owner, ownerPoints, players }) => {
  const [highestContributor, setHighestContributor] = useState(null);
  const [highestPoints, setHighestPoints] = useState(0);
  const [matchNumbers, setMatchNumbers] = useState([]);
  const [contributingPlayers, setContributingPlayers] = useState([]);

  useEffect(() => {
    const mostRecent = ownerPoints[0];
    const previousDayMostRecent = ownerPoints.find((doc) => {
      const docDate = new Date(doc.date);
      const mostRecentDate = new Date(mostRecent.date);
      // return (
      //   docDate.getFullYear() === mostRecentDate.getFullYear() &&
      //   docDate.getMonth() === mostRecentDate.getMonth() &&
      //   docDate.getDate() < mostRecentDate.getDate()
      // );
      return docDate < mostRecentDate; // Compare full dates
    });

    if (previousDayMostRecent) {
      const matchNumbersS = ownerPoints
        .filter(
          (doc) => new Date(doc.date) > new Date(previousDayMostRecent.date)
        )
        .map((doc) => doc.matchNumber);
      setMatchNumbers(matchNumbersS);
    }
  }, [ownerPoints]);

  useEffect(() => {
    if (owner) {
      const ownerPlayers = players.filter((player) => player.owner === owner);

      let highestContributor = null;
      let highestPointsQ = 0;
      const contributingPlayersList = [];

      ownerPlayers.forEach((player) => {
        const pointRows = Array.isArray(player.points) ? player.points : [];
        const totalPoints = pointRows
          .filter((match) => {
            const matchNumber = parseInt(match.matchNumber, 10);
            return matchNumbers
              .map((num) => parseInt(num, 10))
              .includes(matchNumber);
          })
          .reduce((sum, match) => sum + match.points, 0);

        if (totalPoints > 0) {
          contributingPlayersList.push({ name: player.name, points: totalPoints });
        }

        if (totalPoints > highestPointsQ) {
          highestPointsQ = totalPoints;
          highestContributor = player;
        }
      });

      if (highestContributor) {
        setHighestContributor(highestContributor);
        setHighestPoints(highestPointsQ);
        setContributingPlayers(contributingPlayersList);
      } else {
        setHighestContributor(null);
        setHighestPoints(null);
        setContributingPlayers([]);
      }
    } else {
      setHighestContributor(null);
      setHighestPoints(null);
      setContributingPlayers([]);
    }
  }, [owner, players, matchNumbers]);

  return (
    <>
      {highestContributor ? (
        <>
          <h3 className="highest-contributor-title">
            Highest Contributor: <br /> {highestContributor.name}
          </h3>
          <p className="points">Points: {highestPoints}</p>
          
          <ul className="contributing-players-list">
            {contributingPlayers.map((player) => (
              <li
                key={player.name}
                className={
                  player.name === highestContributor.name
                    ? "highest-contributor-item"
                    : "contributor-item"
                }
              >
                <span className="player-name">{player.name} &nbsp; </span>
                <span className="player-points">{player.points}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Hover over your name</p>
      )}
    </>
  );
};

export default HighestContributor;