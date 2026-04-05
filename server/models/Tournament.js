const mongoose = require("mongoose");

const boosterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    multiplier: { type: Number, required: true },
  },
  { _id: false }
);

/** One slice of the outer “stage” donut (e.g. League / Half / Playoffs). */
const matchStageSchema = new mongoose.Schema(
  {
    /** Optional stable id for auction-site logic (e.g. league, league2, playoffs). */
    key: { type: String, default: "" },
    label: { type: String, required: true },
    count: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const tournamentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },

    /** Frontend: only one tournament typically shown as “current” when true. */
    isActive: { type: Boolean, default: true, index: true },

    /** IPL-style team codes for filters, graphs, flags (e.g. CSK, RCB). */
    teams: {
      type: [String],
      default: [],
    },

    /**
     * Match structure for totals validation and stage charts (e.g. MatchesLeft outer ring).
     * `matches.total` is the canonical cap for match numbers (replaces old totalMatches).
     * `stages[].count` should sum to `total` (enforced in admin / app, not DB).
     */
    matches: {
      total: { type: Number, required: true, min: 1 },
      stages: {
        type: [matchStageSchema],
        default: [],
      },
    },

    theme: {
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String, required: true },
    },

    boosters: {
      type: [boosterSchema],
      default: [],
    },
  },
  { collection: "tournaments" }
);

module.exports = mongoose.model("Tournament", tournamentSchema);