import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const LiveTournamentShellContext = createContext(null);

/** Tracks whether {@link LiveTournamentLayout} is mounted (live fantasy chrome only). */
export function LiveTournamentShellProvider({ children }) {
  const [shellMounted, setShellMounted] = useState(false);
  const value = useMemo(
    () => ({ shellMounted, setShellMounted }),
    [shellMounted]
  );
  return (
    <LiveTournamentShellContext.Provider value={value}>
      {children}
    </LiveTournamentShellContext.Provider>
  );
}

export function useLiveTournamentShell() {
  const ctx = useContext(LiveTournamentShellContext);
  if (!ctx) {
    throw new Error(
      "useLiveTournamentShell must be used within LiveTournamentShellProvider"
    );
  }
  return ctx;
}
