import React, { useState } from "react";
import "./CountryPage.css";
// const flagImages = {
//   CSK: '../../assets/flags/CSK.svg',
//   MI: '../../assets/flags/MI.svg',
//   RCB: '../../assets/flags/RCB.svg',
//   KKR: '../../assets/flags/KKR.svg',
//   RR: '../../assets/flags/RR.svg',
//   GT: '../../assets/flags/GT.svg',
//   LSG: '../../assets/flags/LSG.svg',
//   PBKS: '../../assets/flags/PBKS.svg',
//   SRH: '../../assets/flags/SRH.svg',
//   DC: '../../assets/flags/DC.svg',
//   // Add more teams and their flag image paths if needed
// };
function CountryPage({ players }) {
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");

  // Function to handle country selection
  const handleCountrySelection = (event, setter) => {
    const selectedCountry = event.target.value;
    setter(selectedCountry);
  };

  // Function to group players by owner
  const groupPlayersByOwner = (filteredPlayers) => {
    const groupedPlayers = {};
    filteredPlayers.forEach((player) => {
      if (!groupedPlayers[player.owner]) {
        groupedPlayers[player.owner] = [];
      }
      groupedPlayers[player.owner].push(player);
    });
    return groupedPlayers;
  };

  // Function to filter players based on selected countries
  const filteredPlayers1 = players.filter(
    (player) => player.team === country1
  );
  const filteredPlayers2 = players.filter(
    (player) => player.team === country2
  );

  // Group filtered players by owner
  const groupedPlayers1 = groupPlayersByOwner(filteredPlayers1);
  const groupedPlayers2 = groupPlayersByOwner(filteredPlayers2);

  return (
    <div className="country-content">
   
      <div className={`c1-cont  ${country1}`}>
        {/* Display players from the first country */}
        <div className={`country-1 ${country1}`}>
          {/* Dropdown for selecting the first team */}
                <select
                value=""
                onChange={(e) => handleCountrySelection(e, setCountry1)}
                className={`country-select ${country1}`} 
                >
                <option value="">Select Team 1</option>
                <option value="CSK">Chennai Super Kings</option>
                <option value="MI">Mumbai Indians</option>
                <option value="RCB">Royal Challengers Bangalore</option>
                <option value="KKR">Kolkata Knight Riders</option>
                <option value="RR">Rajasthan Royals</option>
                <option value="GT">Gujarat Titans</option>
                <option value="LSG">Lucknow Super Giants</option>
                <option value="PBKS">Punjab Kings</option>
                <option value="SRH">Sunrisers Hyderabad</option>
                <option value="DC">Delhi Capitals</option>
                </select>          
                <div className="country-centering1">
                {Object.entries(groupedPlayers1).map(([owner, players]) => (
                <div key={owner} >
                  <h3>{owner}</h3>
                  <ul>
                  {players.map((player) => (
                    <li key={player.name}>{player.name}</li>
                  ))}
                  </ul>
                </div>
                ))}
              </div>
              </div>
              </div>
              <div className={`c2-cont ${country2}`}>
              {/* Display players from the second team */}
        <div className={`country-2 ${country2}`}>
          {/* Dropdown for selecting the second country */}
          <select
            value=""
            onChange={(e) => handleCountrySelection(e, setCountry2)}
            // className="country-select"
            className={`country-select ${country2}`} 
          >

            <option value="">Select Team 2</option>
                <option value="CSK">Chennai Super Kings</option>
                <option value="MI">Mumbai Indians</option>
                <option value="RCB">Royal Challengers Bangalore</option>
                <option value="KKR">Kolkata Knight Riders</option>
                <option value="RR">Rajasthan Royals</option>
                <option value="GT">Gujarat Titans</option>
                <option value="LSG">Lucknow Super Giants</option>
                <option value="PBKS">Punjab Kings</option>
                <option value="SRH">Sunrisers Hyderabad</option>
                <option value="DC">Delhi Capitals</option>
            {/* Add options for countries */}
          </select>
          
          <div className="country-centering2 ">
            {Object.entries(groupedPlayers2).map(([owner, players]) => (
              <div key={owner}>
                <h3>{owner}</h3>
                <ul>
                  {players.map((player) => (
                    <li key={player.name}>{player.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryPage;
