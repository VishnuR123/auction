import { useContext } from "react";
import { TournamentContext } from "../context/tournamentContext.js";

export function useTournamentDirectory() {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error("useTournamentDirectory must be used within TournamentProvider");
  }
  return ctx;
}
