import { lazy, Suspense } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useTournamentDirectory } from "../hooks/useTournamentDirectory.js";
import LiveTournamentLayout from "../layouts/LiveTournamentLayout.jsx";
import LegacyPlaceholder from "../layouts/LegacyPlaceholder.jsx";
import Ipl25TournamentEntry from "./Ipl25TournamentEntry.jsx";
import T20wc24TournamentEntry from "./T20wc24TournamentEntry.jsx";
import Ipl24TournamentEntry from "./Ipl24TournamentEntry.jsx";
import Wc23TournamentEntry from "./Wc23TournamentEntry.jsx";

/** XP.css shells — lazy so `xp-vendor.css` is not loaded on other tournaments’ routes. */
const T20wc26TournamentEntry = lazy(() => import("./T20wc26TournamentEntry.jsx"));
const Ct25TournamentEntry = lazy(() => import("./Ct25TournamentEntry.jsx"));
const Ipl23TournamentEntry = lazy(() => import("./Ipl23TournamentEntry.jsx"));

export default function TournamentEntry() {
  const { tournamentId } = useParams();
  const { getRegistryEntry, loading } = useTournamentDirectory();
  const entry = getRegistryEntry(tournamentId);

  if (loading) return null;

  if (!entry) {
    return (
      <div className="app-unknown">
        <h1>Unknown tournament</h1>
        <p>
          No entry for “{tournamentId}”. Use the format year-name (e.g. 2026-ipl).
        </p>
      </div>
    );
  }

  if (entry.mode === "legacy") {
    return <LegacyPlaceholder />;
  }

  if (entry.mode === "ipl25") {
    return <Ipl25TournamentEntry />;
  }

  if (entry.mode === "t20wc24") {
    return <T20wc24TournamentEntry />;
  }

  if (entry.mode === "ipl24") {
    return <Ipl24TournamentEntry />;
  }

  if (entry.mode === "wc23") {
    return <Wc23TournamentEntry />;
  }

  if (entry.mode === "t20wc26") {
    return (
      <Suspense fallback={null}>
        <T20wc26TournamentEntry />
      </Suspense>
    );
  }

  if (entry.mode === "ct25") {
    return (
      <Suspense fallback={null}>
        <Ct25TournamentEntry />
      </Suspense>
    );
  }

  if (entry.mode === "ipl23") {
    return (
      <Suspense fallback={null}>
        <Ipl23TournamentEntry />
      </Suspense>
    );
  }

  return (
    <LiveTournamentLayout>
      <Outlet />
    </LiveTournamentLayout>
  );
}
