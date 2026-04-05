import React, { useState, useEffect } from "react";
import { utils, read } from "xlsx";
import PointsTable from "./PointsTable.jsx";
import Team from "./Team.jsx";
import { WC23_EXCEL_URL } from "./wc23Paths.js";

function parseField1Points(row) {
  const raw = row.Field1 ?? row.field1 ?? row.Points ?? row.points ?? "";
  const m = String(raw).match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function mapRow(row) {
  const skill =
    row.dftransfer_plyrskill != null
      ? String(row.dftransfer_plyrskill)
      : "";
  const countryValue = skill.length >= 3 ? skill.substring(0, 3).trim() : "";
  const match = skill.match(/- ([A-Z]+)/);
  const role = match ? match[1] : null;
  const pointsValue = parseField1Points(row);
  return { ...row, Points: pointsValue, Country: countryValue, Role: role };
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
        const response = await fetch(WC23_EXCEL_URL);
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
        const newData = sheetData.map(mapRow);
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
      <div className="wc23-boot">
        <p>Loading WC 2023 spreadsheet…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="wc23-boot wc23-boot--error">
        <p>Could not load Excel data ({loadError}).</p>
        <p className="wc23-boot__hint">
          Place <code>Oct12.xlsx</code> in{" "}
          <code>public/tournaments/2023-wc/data/</code>.
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
            <th>Country</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={`${item.Country ?? ""}`.trim()}>
              <td>{item.Title}</td>
              <td>{item.Points}</td>
              <td>{item.Country}</td>
              <td>{item.Role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcelUploader;
