
import React from 'react'
import { useState,useEffect } from 'react';
import '../HomePage.css';
// function TodayTable({todayPoints, onOwnerHover}) {
//   // const todayPointsLocal () =>{  return todayPoints;  }
//   //   const [todayPointsLocal,setTodayPoints] = useState([]);
//   //   useEffect(() => {
//   //       if(todayPoints.length > 0){
//   //           console.log(todayPoints);
//   //           setTodayPoints(todayPoints);
//   //       }
//   //   },[]);

//   return (
//     <>
//       <h3>Today Points</h3>
//         {todayPoints.length > 0 ? (
//         <ul>
//             {todayPoints.map(([owner, points]) => (
//               <li 
//               key={owner}
//               onMouseEnter={()=> onOwnerHover(owner)}
//               onMouseLeave={()=> onOwnerHover(null)}>
//                 <span>{owner}</span> <span>{points.toFixed(2)}</span> 
//               </li>
//             ))}
//           </ul>):(
//             <div>Waiting to Load</div>
//           )}
//     </>
//   )
// }
function TodayTable({ todayPoints, onOwnerHover }) {
  return (
    <>
      {/* <h3>Today Points</h3> */}
      {todayPoints.length > 0 ? (
        <div className="ipl25-today-points">
          <div className="table-header">
            <span className="team-header2" >Today Points</span>
          </div>
          <div className="table-body">
            {todayPoints.map(([owner, points]) => (
              <div
                className={`table-row ${owner.replace(/\s+/g, "-").replace(/^\d/, "_$&")}`}
                key={owner}
                onMouseEnter={() => onOwnerHover(owner)}
                onMouseLeave={() => onOwnerHover(null)}
              >
                <div className="team-column">
                  <span className="team-name">{owner}</span>
                </div>
                <span className="points-column">{points.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>Waiting to Load</div>
      )}
    </>
  );
}

export default TodayTable