import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTournamentDirectory } from "../hooks/useTournamentDirectory.js";
import {
  tournamentLogoImgOnError,
  tournamentLogoPngUrl,
} from "../utils/tournamentAssets.js";

/**
 * Tournament logo + label; opens list of all registry tournaments.
 * `variant`: "bar" (desktop inline), "compact" (mobile trigger).
 */
function tournamentIdFromPath(pathname) {
  const m = pathname.match(/^\/t\/([^/]+)/);
  return m?.[1] ?? null;
}

/** DB-backed → Live / Ended (`isActive`); static / override-only → Archive. */
function tournamentStatusBadge(tournamentId, apiTournaments) {
  const doc = apiTournaments.find((t) => t._id === tournamentId);
  if (!doc) return "Archive";
  return doc.isActive !== false ? "Live" : "Ended";
}

export default function TournamentSwitcher({ variant = "bar" }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  /** Fallback to pathname parsing when param is unavailable in a nested route. */
  const tournamentId = params.tournamentId ?? tournamentIdFromPath(location.pathname);
  const { apiTournaments, registry, getRegistryEntry } = useTournamentDirectory();
  const [open, setOpen] = useState(false);

  const entry = getRegistryEntry(tournamentId);
  const displayLabel = useMemo(() => {
    if (!entry) return tournamentId;
    const doc = apiTournaments.find((t) => t._id === tournamentId);
    return doc?.name ?? entry.label;
  }, [entry, apiTournaments, tournamentId]);

  const selectTournament = (id) => {
    setOpen(false);
    const target = getRegistryEntry(id);
    const m = location.pathname.match(/^\/t\/[^/]+\/?(.*)$/);
    const rest = (m?.[1] ?? "").replace(/\/$/, "");
    if (target?.mode === "live" && rest) {
      navigate(`/t/${id}/${rest}`);
    } else {
      navigate(`/t/${id}`);
    }
  };

  return (
    <div className={`tournament-switcher tournament-switcher--${variant}`}>
      <button
        type="button"
        className="tournament-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <img
          key={tournamentId}
          className="tournament-switcher__logo"
          src={tournamentLogoPngUrl(tournamentId)}
          alt=""
          onLoad={(e) => {
            e.currentTarget.style.visibility = "";
            e.currentTarget.style.opacity = "";
          }}
          onError={tournamentLogoImgOnError(tournamentId)}
        />
        <span className="tournament-switcher__name">{displayLabel}</span>
        <span className="tournament-switcher__caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="tournament-switcher__backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <ul className="tournament-switcher__menu" role="listbox">
            {registry.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  role="option"
                  className={
                    t.id === tournamentId
                      ? "tournament-switcher__option tournament-switcher__option--active"
                      : "tournament-switcher__option"
                  }
                  onClick={() => selectTournament(t.id)}
                >
                  <img
                    src={tournamentLogoPngUrl(t.id)}
                    alt=""
                    className="tournament-switcher__menu-logo"
                    onError={tournamentLogoImgOnError(t.id, {
                      finalFailure: "dim",
                    })}
                  />
                  <span className="tournament-switcher__label">{t.label}</span>
                  <span className="tournament-switcher__mode">
                    {tournamentStatusBadge(t.id, apiTournaments)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
