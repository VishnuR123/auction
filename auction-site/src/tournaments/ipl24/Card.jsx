import React from "react";

function Card(props) {
  const players = props.players;
  const [input1, input2] = props.selectedCountries;
  const tempcountry1pl = [];
  const tempcountry2pl = [];
  for (const player of props.data) {
    if (player.Country && player.Country.trim() === input1) {
      tempcountry1pl.push(player.Title);
    } else if (player.Country && player.Country.trim() === input2) {
      tempcountry2pl.push(player.Title);
    }
  }
  const countryPlayers = [...tempcountry1pl, ...tempcountry2pl];

  const commonPlayers = players.filter((player) =>
    countryPlayers.includes(player)
  );
  return (
    <div className="Card">
      <h2 className="name">{props.personName}</h2>
      <table className="card-table">
        <tbody>
          {commonPlayers.map((common) => (
            <tr key={common} className="card-tr">
              <td className="players">{common}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Card;
