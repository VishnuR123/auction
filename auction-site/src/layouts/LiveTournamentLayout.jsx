import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useLiveTournamentShell } from "../context/LiveTournamentShellContext.jsx";
import { useResolvedTournament } from "../hooks/useResolvedTournament.js";
import TournamentSwitcher from "../components/TournamentSwitcher.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const NAV = [
  { to: "", label: "Home", end: true },
  { to: "owners", label: "Owners" },
  { to: "players", label: "Players" },
  { to: "lineup", label: "Lineup" },
  { to: "booster", label: "Booster" },
  { to: "past-results", label: "Past results" },
];

export default function LiveTournamentLayout({ children }) {
  const { tournamentId } = useParams();
  const resolved = useResolvedTournament(tournamentId);
  const [navOpen, setNavOpen] = useState(false);
  const { setShellMounted } = useLiveTournamentShell();

  useEffect(() => {
    setShellMounted(true);
    return () => setShellMounted(false);
  }, [setShellMounted]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--auction-accent", resolved.theme.primaryColor);
    root.style.setProperty("--auction-accent-2", resolved.theme.secondaryColor);
    return () => {
      root.style.removeProperty("--auction-accent");
      root.style.removeProperty("--auction-accent-2");
    };
  }, [resolved.theme.primaryColor, resolved.theme.secondaryColor]);

  const base = `/t/${tournamentId}`;

  return (
    <div className="live-shell">
      <header className="live-shell__top">
        <div className="live-shell__top-inner">
          <button
            type="button"
            className="live-shell__burger"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
          >
            ☰
          </button>

          <div className="live-shell__switcher-wrap">
            <TournamentSwitcher variant="bar" />
          </div>

          <div className="live-shell__toolbar-end">
            <nav className="live-shell__nav" aria-label="Main">
              {NAV.map(({ to, label, end }) => (
                <NavLink
                  key={to || "home"}
                  to={to ? `${base}/${to}` : base}
                  end={end}
                  className={({ isActive }) =>
                    isActive
                      ? "live-shell__nav-link live-shell__nav-link--active"
                      : "live-shell__nav-link"
                  }
                  onClick={() => setNavOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {navOpen ? (
        <button
          type="button"
          className="live-shell__drawer-backdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <aside
        className={
          navOpen ? "live-shell__drawer live-shell__drawer--open" : "live-shell__drawer"
        }
        aria-hidden={!navOpen}
      >
        <div className="live-shell__drawer-head">
          <span className="live-shell__drawer-title">Menu</span>
          <button
            type="button"
            className="live-shell__drawer-close"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
        </div>
        <nav className="live-shell__drawer-nav">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to || "home"}
              to={to ? `${base}/${to}` : base}
              end={end}
              className={({ isActive }) =>
                isActive
                  ? "live-shell__drawer-link live-shell__drawer-link--active"
                  : "live-shell__drawer-link"
              }
              onClick={() => setNavOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="live-shell__main">{children}</main>
    </div>
  );
}
