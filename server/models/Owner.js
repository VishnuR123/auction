const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    tournamentId: { type: String, required: true, index: true },

    name: { type: String, required: true },
    shortName: { type: String, required: true },

    /** Main brand color for this owner (auction-site). */
    primaryColor: { type: String, required: true },
    /** Accent / secondary UI color. */
    secondaryColor: { type: String, required: true },
  },
  { collection: "owners" }
);

module.exports = mongoose.model("Owner", ownerSchema);
