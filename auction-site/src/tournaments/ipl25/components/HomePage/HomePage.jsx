import React from "react";
import "../HomePage/HomePage.css";
import myIcon from "../../assets/blob.svg";
import myIcon1 from "../../assets/blob1.svg";
import myIcon2 from "../../assets/blob2.svg";
import myIcon3 from "../../assets/blob3.svg";

import TodayTable from "./HomePage Components/TodayTable";
import OwnerGraph from "./HomePage Components/OwnerGraph";
import HighestContributor from "./HomePage Components/HighestContributor";
import TotalContribution from "./HomePage Components/TotalContribution";
import MatchesLeft from "./HomePage Components/MatchesLeft";
import { useState, useEffect } from "react";
import EgoistsLogo from "../../assets/logo/Egoists.svg";
import LBWLogo from "../../assets/logo/LBW.svg";
import RetroBoysLogo from "../../assets/logo/Retro Boys.svg";
import FourthStumpLogo from "../../assets/logo/4th Stump.svg";
import Nine11Logo from "../../assets/logo/Nine 11.svg";
import DaddiesArmyLogo from "../../assets/logo/Daddies Army.svg";
import CumballLogo from "../../assets/logo/Cumball.svg";
import Chill11Logo from "../../assets/logo/Chill 11.svg";
import RCBLogo from "../../assets/logo/RCB.svg";

function HomePage({ players, ownerPoints }) {
  const [pointsTable, setPointsTable] = useState([]);
  const [matchesLeft, setMatchesLeft] = useState(null);
  const [todayPoints, setTodayPoints] = useState({});
  const [hoveredOwner, setHoveredOwner] = useState(null);
  const ownerLogos = {
    'Egoists': EgoistsLogo,
    'LBW': LBWLogo,
    'Retro Boys': RetroBoysLogo,
    '4th Stump': FourthStumpLogo,
    'Nine 11': Nine11Logo,
    'Daddies Army': DaddiesArmyLogo,
    'Cumball': CumballLogo,
    'Chill 11': Chill11Logo,
    'RCBangbros': RCBLogo,
  };

  useEffect(() => {
    if (players.length > 0 && ownerPoints.length > 0) {
      // Perform your calculations here
      const mostRecent = ownerPoints[0];
      // Define the points to subtract
      // const pointsToSubtract = {
      //   Shriman: 106.89,
      //   Sakthi: 105.01,
      //   Shashwat: 247.99,
      //   Sanjay: 90.21,
      // };

      // Adjust the points before sorting
      // const adjustedPoints = Object.entries(mostRecent.points)
      //   .filter(([key, value]) => key !== "date" && key !== "matchNumber")
      //   .map(([owner, points]) => {
      //     const adjustedPoints = pointsToSubtract[owner]
      //       ? points - pointsToSubtract[owner]
      //       : points;
      //     return [owner, adjustedPoints];
      //   });
        // Sort the points
      // const sortedPoints = adjustedPoints.sort(([, a], [, b]) => b - a);

      const sortedPoints = Object.entries(mostRecent.points)
        .filter(([key, value]) => key !== "date")
        .filter(([key, value]) => key !== "matchNumber")
        .sort(([, a], [, b]) => b - a);
      // setPointsTable(sortedPoints);
      // Calculate differences
      const pointsWithDifferences = sortedPoints.map(
        ([owner, points], index, arr) => {
          const prevPoints = arr[index - 1] ? arr[index - 1][1] : null;
          const difference = prevPoints !== null ? points - prevPoints : null;

          return {
            owner,
            points,
            difference,
            logo: ownerLogos[owner],
          };
        }
      );

      setPointsTable(pointsWithDifferences);
      //Matches Left Component Calculation
      const matchNumber = mostRecent.matchNumber;
      const totalMatches = 74; // example total matches
      const matchesLeftCalc = totalMatches - matchNumber;
      setMatchesLeft(matchesLeftCalc);

      // Find the previous day's most recent document or most recent document that doesnt belong today
      const documentsNotToday = ownerPoints.filter((doc) => {
        const docDate = new Date(doc.date);
        const mostRecentDate = new Date(mostRecent.date);
        // return docDate.getDate() < mostRecentDate.getDate();
        return docDate < mostRecentDate;
        // return (
        //   docDate.getFullYear() === mostRecentDate.getFullYear() &&
        //   docDate.getMonth() === mostRecentDate.getMonth() &&
        //   docDate.getDate() < mostRecentDate.getDate()
        // );
      });
      const mostRecentNotToday = documentsNotToday[0];

      if (mostRecentNotToday) {
        const todayPointsCalc = {};
        for (const [owner, points] of Object.entries(mostRecent.points)) {
          todayPointsCalc[owner] =
            points - (mostRecentNotToday.points[owner] || 0);
        }

        const sortedPoints = Object.entries(todayPointsCalc).sort(
          ([, a], [, b]) => b - a
        );
        setTodayPoints(sortedPoints);
      }
    }
    console.log("askdksajd"); // Check if data is being passed correctly
    console.log(todayPoints); // Check if data is being passed correctly
  }, [players, ownerPoints]);

  return (
    <div className="ipl25-home">
      <div className="home-grid">
        <div className="main-table container">
          {/* <h3>Points Table</h3> */}
          {ownerPoints.length > 0 ? (
            <div className="points-table">
              <div className="table-header">
                <span className="team-header">Team</span>
                <span className="points-header">Pts</span>
                <span className="difference-header">Df</span>
              </div>
              <div className="table-body">
                {pointsTable.map(
                  ({ owner, points, difference, logo }, index) => (
                    <div className={`table-row`} key={index}>
                      <div className="team-column">
                        <img
                          src={logo}
                          alt={`${owner} logo`}
                          className="team-logo"
                        />
                        <span className="team-name">{owner}</span>
                      </div>
                      <span className="points-column">{points}</span>
                      <span className="difference-column">
                        {difference !== null ? difference.toFixed(2) : "-"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <p>Loading owner points...</p>
          )}
        </div>
        <div className="today-table container">
          <TodayTable
            todayPoints={todayPoints}
            onOwnerHover={setHoveredOwner}
          />
        </div>
        <div className="main-contributor container">
          <HighestContributor
            players={players}
            ownerPoints={ownerPoints}
            owner={hoveredOwner}
          />
          <img src={myIcon} className="blob" alt="" />
          <img src={myIcon1} className="blob1" alt="" />
          <img src={myIcon2} className="blob2" alt="" />
          <img src={myIcon3} className="blob3" alt="" />
        </div>
        <div className="matches-left container">
        <h3>Matches Left</h3>
          <MatchesLeft matchesLeft={matchesLeft}></MatchesLeft>
        </div>
      </div>
      <div className="home-grid2">
        <div className="graph-1 container">
          <OwnerGraph ownerPoints={ownerPoints} />
        </div>
        <div className="total-contribution container">
          <TotalContribution players={players} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
