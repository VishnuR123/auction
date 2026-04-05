import React, { useEffect, useState } from "react";
import "./HighestContributor.css";
import IND from "../../../assets/flags/IND.png";
import PAK from "../../../assets/flags/PAK.png";
import USA from "../../../assets/flags/USA.png";
import IRE from "../../../assets/flags/IRE.png";
import AUS from "../../../assets/flags/IND.png";
import ENG from "../../../assets/flags/IND.png";
import NZ from "../../../assets/flags/IND.png";
import WI from "../../../assets/flags/IND.png";
import AFG from "../../../assets/flags/IND.png";
import SA from "../../../assets/flags/IND.png";
import NED from "../../../assets/flags/IND.png";
import SL from "../../../assets/flags/IND.png";
import BAN from "../../../assets/flags/IND.png";

const HighestContributor = ({ owner, ownerPoints, players }) => {
  const [highestContributor, setHighestContributor] = useState(null);
  const [highestPoints, setHighestPoints] = useState(0);
  const [matchNumbers, setMatchNumbers] = useState([]);

  useEffect(() => {
    const mostRecent = ownerPoints[0];
    const previousDayMostRecent = ownerPoints.find((doc) => {
      const docDate = new Date(doc.date);
      // console.log("curr doc date")
      // console.log(docDate)
      const mostRecentDate = new Date(mostRecent.date);
      // console.log("most recent date")
      // console.log(mostRecentDate)
      return (
        docDate.getFullYear() === mostRecentDate.getFullYear() &&
        docDate.getMonth() === mostRecentDate.getMonth() &&
        docDate.getDate() < mostRecentDate.getDate()
      );
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

      ownerPlayers.forEach((player) => {
        const pointRows = Array.isArray(player.points) ? player.points : [];
        const totalPoints = pointRows
          .filter((match) => {
            const matchNumber = parseInt(match.matchNumber, 10);
            const isInMatchNumbers = matchNumbers
              .map((num) => parseInt(num, 10))
              .includes(matchNumber);
            return isInMatchNumbers;
          })
          .reduce((sum, match) => sum + match.points, 0);

        if (totalPoints > highestPointsQ) {
          highestPointsQ = totalPoints;
          highestContributor = player;
        }
      });
      if (highestContributor) {
        setHighestContributor(highestContributor);
        setHighestPoints(highestPointsQ);
      } else {
        setHighestContributor(null);
        setHighestPoints(null);
      }
    } else {
      setHighestContributor(null);
      setHighestPoints(null);
    }
  }, [owner, players, matchNumbers]);

  return (
    <>
      {highestContributor ? (
        <>
          <img
            // src={highestContributor.country}
            alt=""
            className={`flag-tag ${highestContributor.country}`}
          />
          <h3>Highest Contributor {highestContributor.name}</h3>
          <p className="points">Points: {highestPoints}</p>
        </>
      ) : (
        <p>Hover over your name</p>
      )}
    </>
  );
};

export default HighestContributor;
