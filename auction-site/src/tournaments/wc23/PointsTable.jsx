import React, { useState, useEffect } from "react";
import { WC23_PEOPLE_URL } from "./wc23Paths.js";

export default function PointsTable(props) {
  const [peopleData, setPeopleData] = useState([]);
  const [inputText, setInputText] = useState("");
  const [pointResults, setPointResults] = useState([]);
  const [playerResults, setPlayerResults] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(WC23_PEOPLE_URL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPeopleData(data);
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    };

    fetchData();
  }, []);

  function sorter() {
    const playerPoints = props.data;
    for (const person of peopleData) {
      person.points = 0;
      if (person.personName === "Sathish") {
        person.points -= 58;
      }
      if (person.personName === "Saran") {
        person.points -= 57;
      }
    }
    for (const playerPoint of playerPoints) {
      const playerNameToFind = playerPoint.Title;

      for (const person of peopleData) {
        if (person.players.includes(playerNameToFind)) {
          person.points += playerPoint.Points;
          break;
        }
      }
    }
    const sortedData = [...peopleData].sort((a, b) => b.points - a.points);
    setPeopleData(sortedData);
  }

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkInput(inputText);
    setIsSubmitted(true);
  };

  const checkInput = (userInput) => {
    const excelsheet = props.data;

    const temparr = [];
    for (const personEntry of peopleData) {
      if (personEntry.personName === userInput) {
        for (let i = 0; i < personEntry.players.length; i++) {
          temparr.push(personEntry.players[i]);
        }
        break;
      }
    }

    const temppoints = [];
    const tempplayers = [];
    for (const playerEntry of excelsheet) {
      if (temparr.includes(playerEntry.Title)) {
        tempplayers.push(playerEntry.Title);
        temppoints.push(playerEntry.Points);
        if (tempplayers.length === 16) break;
      }
    }
    setPlayerResults(tempplayers);
    setPointResults(temppoints);
  };

  return (
    <div className="main-con">
      <div className="box">
        <button type="button" onClick={() => sorter()}>
          View Points
        </button>
        <div className="container">
          {peopleData.map((person, index) => (
            <div key={index}>
              <button type="button" className="one">
                {person.personName} - {person.points}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="spacer" />
      <div className="divider" />
      <div className="spacer" />
      <div className="box">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter text"
            value={inputText}
            onChange={handleInputChange}
          />
          <button type="submit">Submit</button>
        </form>
        {isSubmitted && (
          <div>
            <table className="ind">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {playerResults.map((item, index) => (
                  <tr key={index}>
                    <td>{item}</td>
                    <td>{pointResults[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
