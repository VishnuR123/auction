
import React from 'react'
import '../HomePage.css';
function TodayTable({ todayPoints, onOwnerHover }) {
  return (
    <>
      <h3>Today Points</h3>
        {todayPoints.length > 0 ? (
        <ul>
            {todayPoints.map(([owner, points]) => (
              <li 
              key={owner}
              onMouseEnter={()=> onOwnerHover(owner)}
              onMouseLeave={()=> onOwnerHover(null)}>
                <span>{owner}</span> <span>{points.toFixed(2)}</span> 
              </li>
            ))}
          </ul>):(
            <div>Waiting to Load</div>
          )}
    </>
  )
}

export default TodayTable
