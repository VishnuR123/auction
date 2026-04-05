require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const tournamentRoutes = require("./routes/tournamentRoutes");
const playerRoutes = require("./routes/playerRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const matchdayRoutes = require("./routes/matchdayRoutes");
const matchRoutes = require("./routes/matchRoutes");
const importRoutes = require("./routes/importRoutes");
const pastResultsRoutes = require("./routes/pastResultsRoutes");
const iplFantasyRoutes = require("./routes/iplFantasyRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("Missing MONGO_URL in environment");
  process.exit(1);
}

/** Without a DB name in the URI, MongoDB defaults to `test`. This forces `fantasy` unless overridden. */
mongoose.connect(MONGO_URL, {
  dbName: process.env.MONGO_DB_NAME || "fantasy",
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
  res.json({ ok: true, service: "fantasy-cricket-api" });
});

app.use("/api/tournaments", tournamentRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/matchdays", matchdayRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/import", importRoutes);
app.use("/api/past-results", pastResultsRoutes);
app.use("/api/ipl-fantasy", iplFantasyRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
