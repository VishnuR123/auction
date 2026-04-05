import React, { useState, useEffect } from "react";
import { utils, read } from "xlsx";
import PointsTable from "./PointsTable.jsx";
import Team from "./Team.jsx";
import { IPL24_EXCEL_URL } from "./ipl24Paths.js";

function parsePointsCell(raw) {
  if (raw == null || raw === "") return 0;
  const s = String(raw);
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function ExcelUploader() {
  const [data, setData] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoadError(null);
      setLoading(true);
      try {
        const response = await fetch(IPL24_EXCEL_URL);
        if (!response.ok) {
          throw new Error(response.statusText || String(response.status));
        }
        const blob = await response.blob();

        const arrayBuffer = await blob.arrayBuffer();
        if (cancelled) return;

        const workbook = read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = utils.sheet_to_json(sheet);

        const newData = sheetData.map((row) => {
          const pointsValue = parsePointsCell(row.points ?? row.Points);
          const teamValue = row.team ?? row.Team ?? "";
          return { ...row, Points: pointsValue, Country: teamValue };
        });

        setData(newData);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching or reading the XLSX file:", error);
          setLoadError(error?.message ?? "Failed to load spreadsheet");
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="ipl24-boot">
        <p>Loading IPL 24 spreadsheet…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="ipl24-boot ipl24-boot--error">
        <p>Could not load Excel data ({loadError}).</p>
        <p className="ipl24-boot__hint">
          Place <code>Apr16.xlsx</code> in{" "}
          <code>public/tournaments/2024-ipl/data/</code> (see IPL-Fantasy-2024
          repo).
        </p>
      </div>
    );
  }

  return (
    <div>
      <PointsTable data={data} />
      <br />
      <h1>Individual Teams</h1>
      <Team data={data} />
      <br />
      <h1>All Player Data</h1>
      <br />

      <table className="master">
        <thead>
          <tr>
            <th>Players</th>
            <th>Points</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={`${item.Country ?? ""}`.trim()}>
              <td>{item.Title}</td>
              <td>{item.Points}</td>
              <td>{item.Country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcelUploader;
