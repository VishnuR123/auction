import React, { useState } from "react";
import "./CountryPage.css";
// const flagImages = {
//   IND: '../../assets/flags/IND.png',
//   PAK: '../../assets/flags/PAK.png',
//   USA: '../../assets/flags/USA.png',
//   IRE: '../../assets/flags/IRE.png',
//   AUS: '../../assets/flags/AUS.png',
//   ENG: '../../assets/flags/ENG.png',
//   AFG: '../../assets/flags/AFG.png',
//   BAN: '../../assets/flags/BAN.png',
//   NED: '../../assets/flags/NED.png',
//   WI: '../../assets/flags/WI.png',
//   NZ: '../../assets/flags/NZ.png',
//   SA: '../../assets/flags/SA.png',
//   SL: '../../assets/flags/SL.png',
//   // Add more countries and their flag image paths
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
    (player) => player.country === country1
  );
  const filteredPlayers2 = players.filter(
    (player) => player.country === country2
  );

  // Group filtered players by owner
  const groupedPlayers1 = groupPlayersByOwner(filteredPlayers1);
  const groupedPlayers2 = groupPlayersByOwner(filteredPlayers2);

  return (
    <div className="country-content">
   
      <div className={`c1-cont  ${country1}`}>
        {/* Display players from the first country */}
        <div className={`country-1 ${country1}`}>
          {/* Dropdown for selecting the first country */}
          <select
            value=""
            onChange={(e) => handleCountrySelection(e, setCountry1)}
            className={`country-select ${country1}`} 
          >
            <option value="">Select Country 1</option>
            <option value="IND">India</option>
            <option value="PAK">Pakistan</option>
            <option value="USA">USA</option>
            <option value="IRE">Ireland</option>
            <option value="AUS">Australia</option>
            <option value="ENG">England</option>
            <option value="AFG">Afghanistan</option>
            <option value="WI">West Indies</option>
            <option value="NZ">New Zealand</option>
            <option value="SA">South Africa</option>
            <option value="SL">Sri Lanka</option>
            <option value="BAN">Bangladesh</option>
            <option value="NED">Netherlands</option>
            {/* Add options for countries */}
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
        {/* Display players from the second country */}
        <div className={`country-2 ${country2}`}>
          {/* Dropdown for selecting the second country */}
          <select
            value=""
            onChange={(e) => handleCountrySelection(e, setCountry2)}
            // className="country-select"
            className={`country-select ${country2}`} 
          >
            <option value="" disabled>Select Country 2</option>
            <option value="IND">India</option>
            <option value="PAK">Pakistan</option>
            <option value="USA">USA</option>
            <option value="IRE">Ireland</option>
            <option value="AUS">Australia</option>
            <option value="ENG">England</option>
            <option value="AFG">Afghanistan</option>
            <option value="WI">West Indies</option>
            <option value="NZ">New Zealand</option>
            <option value="SA">South Africa</option>
            <option value="SL">Sri Lanka</option>
            <option value="BAN">Bangladesh</option>
            <option value="NED">Netherlands</option>
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
