import React, { useState, useEffect } from "react";
import { IPL24_PEOPLE_URL, IPL24_PREVIOUS_POINTS_URL } from "./ipl24Paths.js";

export default function PointsTable(props) {
  const [peopleData, setPeopleData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [resultArray, setResultArray] = useState([]);

  const [inputText, setInputText] = useState("");
  const [pointResults, setPointResults] = useState([]);
  const [playerResults, setPlayerResults] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(IPL24_PEOPLE_URL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPeopleData(data);

        const otherResponse = await fetch(IPL24_PREVIOUS_POINTS_URL);
        if (!otherResponse.ok) {
          throw new Error("Network response for other data was not ok");
        }
        const otherData = await otherResponse.json();
        setPreviousData(otherData);
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
      if (person.personName === "Sanjay") {
        person.points += 2497;
        person.points -= 447;
      }
      if (person.personName === "Saran") {
        person.points += 1760;
        person.points -= 69;
      }
      if (person.personName === "Sathish") {
        person.points += 1546.5;
      }
      if (person.personName === "Shashwat") {
        person.points += 2141;
      }
      if (person.personName === "Shriman") {
        person.points += 2574.5;
        person.points -= 4;
      }
      if (person.personName === "Subu") {
        person.points += 3101;
        person.points -= 6;
      }
      if (person.personName === "Vishnu") {
        person.points += 2912;
      }
      if (person.personName === "Yukesh") {
        person.points += 2712;
        person.points -= 138;
      }
      if (person.personName === "Sakthi") {
        person.points += 10;
      }
    }
    for (const playerPoint of playerPoints) {
      const playerNameToFind = playerPoint.Title;

      const viceCaptainNames = [
        "Yuzvendra Chahal",
        "Shikhar Dhawan",
        "Wriddhiman Saha",
        "MS Dhoni",
        "Jasprit Bumrah",
        "Rinku Singh",
        "Ravi Bishnoi",
        "Suyash Sharma",
      ];
      const captainNames = [
        "Virat Kohli",
        "David Warner",
        "Shubman Gill",
        "Glenn Maxwell",
        "Faf du Plessis",
        "Ruturaj Gaikwad",
        "Ishan Kishan",
        "Yashasvi Jaiswal",
      ];

      for (const person of peopleData) {
        if (person.players.includes(playerNameToFind)) {
          if (captainNames.includes(playerNameToFind)) {
            person.points += playerPoint.Points * 2;
            break;
          }
          if (viceCaptainNames.includes(playerNameToFind)) {
            person.points += playerPoint.Points * 1.5;
            break;
          }
          person.points += playerPoint.Points;
          break;
        }
      }
    }
    const sortedData = [...peopleData].sort((a, b) => b.points - a.points);
    setPeopleData(sortedData);
  }

  const helper = () => {
    const resultArrayString = JSON.stringify(peopleData, null, 2);
    navigator.clipboard
      .writeText(resultArrayString)
      .then(() => alert("Result array copied to clipboard"))
      .catch((error) => console.error("Failed to copy:", error));
  };

  const calculateDifference = () => {
    const tempResultArray = previousData.map((item1) => {
      const item2 = peopleData.find(
        (item) => item.personName === item1.personName
      );
      return {
        personName: item1.personName,
        difference: item2 ? item2.points - item1.points : 0,
      };
    });
    const sortedResultData = [...tempResultArray].sort(
      (a, b) => b.difference - a.difference
    );
    setResultArray(sortedResultData);
  };

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

    const tempplayers = [];
    const temppoints = [];
    for (const playerEntry of excelsheet) {
      if (temparr.includes(playerEntry.Title)) {
        tempplayers.push(playerEntry.Title);
        temppoints.push(playerEntry.Points);
      }
    }
    setPlayerResults(tempplayers);
    setPointResults(temppoints);
  };

  return (
    <>
      <div className="main-con">
        <div className="box">
          <button type="button" onClick={() => sorter()}>
            View Points
          </button>
          <button type="button" onClick={() => helper()}>
            Press
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
      <button
        type="button"
        onClick={() => calculateDifference()}
        className="title"
      >
        {" "}
        View Today Points
      </button>
      <div className="main-con2">
        {resultArray.map((item) => (
          <div key={item.personName}>
            {item.personName} {item.difference}
          </div>
        ))}
      </div>
    </>
  );
}
