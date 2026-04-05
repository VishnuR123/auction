const Tournament = require("../models/Tournament");
const Owner = require("../models/Owner");

/**
 * Ensures owner exists for this tournament and teamCode is listed on the tournament.
 */
async function assertPlayerRefs(tournamentId, ownerId, teamCode) {
  if (!tournamentId || !ownerId || !teamCode) {
    throw new Error("tournamentId, ownerId, and teamCode are required");
  }
  const tournament = await Tournament.findById(tournamentId).lean();
  if (!tournament) {
    throw new Error("Tournament not found");
  }
  const codes = tournament.teams || [];
  if (!codes.includes(teamCode)) {
    throw new Error(
      `teamCode "${teamCode}" must be one of this tournament's teams: ${codes.join(", ") || "(none configured)"}`
    );
  }
  const owner = await Owner.findOne({ _id: ownerId, tournamentId }).lean();
  if (!owner) {
    throw new Error("ownerId not found for this tournament");
  }
}

module.exports = { assertPlayerRefs };
