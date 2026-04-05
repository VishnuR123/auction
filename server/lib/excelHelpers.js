const XLSX = require("xlsx");

/**
 * @param {string} name
 * @param {import("xlsx").WorkBook} workbook
 */
function pickSheet(workbook, preferredNames) {
  const lower = preferredNames.map((n) => n.toLowerCase());
  const found = workbook.SheetNames.find((sn) =>
    lower.includes(String(sn).trim().toLowerCase())
  );
  return found || workbook.SheetNames[0];
}

/**
 * @param {import("xlsx").WorkBook} workbook
 * @param {string[]} sheetNameHints
 */
function sheetToRows(workbook, sheetNameHints) {
  const name = pickSheet(workbook, sheetNameHints);
  if (!name) return { sheetName: null, rows: [] };
  const sheet = workbook.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  const normalized = rows.map((row) => {
    const o = {};
    for (const [k, v] of Object.entries(row)) {
      o[String(k).trim()] = v;
    }
    return o;
  });
  return { sheetName: name, rows: normalized };
}

function parseBool(v) {
  if (v === null || v === undefined || v === "") return false;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return Boolean(v);
}

function parseNumber(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function str(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

module.exports = {
  sheetToRows,
  parseBool,
  parseNumber,
  str,
  XLSX,
};
