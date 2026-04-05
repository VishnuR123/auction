import { useEffect, useMemo, useState } from "react";
import { ConfigProvider } from "antd";
import { apiGet } from "../../api/client.js";
import {
  parseOldTournamentsJson,
  mergeTournamentLists,
  buildCumulativeTotals,
} from "../../lib/pastResultsModel.js";
import "./pastResultsPage.css";

function typeIconSrc(type) {
  const t = String(type || "").toLowerCase();
  if (t === "draft") return "/draft (2).png";
  return "/auction.png";
}

function capitalizeOwnerId(id) {
  const s = String(id ?? "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function typeTooltip(type) {
  const t = String(type || "").toLowerCase();
  if (t === "draft") {
    return "Draft: squads were built using a draft order.";
  }
  return "Auction: squads were built using an auction.";
}

function formatPts(n) {
  const x = Number(n) || 0;
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
}

const PAST_RESULTS_FONT =
  '"Editorial New", Georgia, "Times New Roman", serif';

function PastResultsRoot({ children }) {
  return (
    <ConfigProvider theme={{ token: { fontFamily: PAST_RESULTS_FONT } }}>
      {children}
    </ConfigProvider>
  );
}

export default function PastResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jsonRaw, setJsonRaw] = useState(null);
  const [dbPayload, setDbPayload] = useState(null);
  const [openKeys, setOpenKeys] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const jsonP = fetch("/past-results-old-tournaments.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));

    const dbP = apiGet("/api/past-results/db-standings").catch(() => ({
      tournaments: [],
    }));

    Promise.all([jsonP, dbP])
      .then(([json, db]) => {
        if (cancelled) return;
        setJsonRaw(json && typeof json === "object" ? json : {});
        setDbPayload(db);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load past results");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { merged, cumulative } = useMemo(() => {
    const jsonEntries = jsonRaw ? parseOldTournamentsJson(jsonRaw) : [];
    const dbT = dbPayload?.tournaments || [];
    const mergedList = mergeTournamentLists(jsonEntries, dbT);
    const cum = buildCumulativeTotals(mergedList);
    return { merged: mergedList, cumulative: cum };
  }, [jsonRaw, dbPayload]);

  const toggle = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <PastResultsRoot>
        <div className="past-results-page">
          <div className="paper-background" aria-hidden />
          <div className="past-results-page__inner" style={{ padding: 24, position: "relative", zIndex: 1 }}>
            Loading…
          </div>
        </div>
      </PastResultsRoot>
    );
  }

  if (error) {
    return (
      <PastResultsRoot>
        <div className="past-results-page">
          <div className="paper-background" aria-hidden />
          <div className="past-results-page__inner" style={{ padding: 24, position: "relative", zIndex: 1 }}>
            {error}
          </div>
        </div>
      </PastResultsRoot>
    );
  }

  return (
    <PastResultsRoot>
      <div className="past-results-page">
        <div className="paper-background" aria-hidden />
        <div className="past-results-page__inner">
          <div className="past-results__scroll">
            <section className="past-results__cumulative" aria-label="Cumulative points">
              <div className="past-results__cumulative-title">CUMULATIVE</div>
              <div className="past-results__cumulative-title">POINTS</div>
              <div className="past-results__table-wrap">
                <table className="past-results__table">
                  <thead>
                    <tr>
                      <th scope="col">Owner</th>
                      <th scope="col">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cumulative.map((row) => (
                      <tr key={String(row.ownerId || row.name)}>
                        <td>{capitalizeOwnerId(row.ownerId || row.name)}</td>
                        <td>{formatPts(row.points)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {merged.map((item) => {
              const open = openKeys.has(item.key);
              return (
                <div className="past-results__col" key={item.key}>
                  <button
                    type="button"
                    className={`past-results__strip ${open ? "past-results__strip--active" : ""}`}
                    onClick={() => toggle(item.key)}
                    aria-expanded={open}
                    aria-controls={`past-detail-${item.key}`}
                  >
                    <span className="past-results__strip-name">{item.displayName}</span>
                    <span className="past-results__strip-bottom">
                      <span className="past-results__year">{item.year}</span>
                      <img
                        src={typeIconSrc(item.type)}
                        alt=""
                        title={typeTooltip(item.type)}
                        className="past-results__type-icon"
                        width={40}
                        height={40}
                      />
                    </span>
                  </button>
                  <div
                    id={`past-detail-${item.key}`}
                    className={`past-results__detail ${open ? "past-results__detail--open" : ""}`}
                    aria-hidden={!open}
                  >
                    {open ? (
                      <>
                        <h3 className="past-results__detail-title">Final standings</h3>
                        <div className="past-results__detail-body">
                          <table className="past-results__table">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Team</th>
                                <th scope="col">Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.standings.length === 0 ? (
                                <tr>
                                  <td colSpan={3} className="past-results__muted">
                                    No standings yet.
                                  </td>
                                </tr>
                              ) : (
                                item.standings.map((row, i) => (
                                  <tr key={`${item.key}-${row.ownerId}-${i}`}>
                                    <td>{i + 1}</td>
                                    <td>
                                      <span className="past-results__team-name">{row.name}</span>
                                      {row.ownerId ? (
                                        <span className="past-results__team-id">
                                          {" "}
                                          ({capitalizeOwnerId(row.ownerId)})
                                        </span>
                                      ) : null}
                                    </td>
                                    <td>{formatPts(row.points)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                          {item.source === "db" && item.firstMatchDate ? (
                            <p className="past-results__muted">
                              First matchday: {item.firstMatchDate}
                            </p>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}

            <div className="past-results__closing">
              <section
                className="past-results__gratitude"
                aria-label="Thanks"
              >
                <p className="past-results__gratitude-text">
                  {/* &ldquo; */}
                  <span className="past-results__gratitude-dropcap">A</span>
                  {" "}
                  short note of gratitude for everyone who participated and
                  helped conduct these tournaments.
                  {/* &rdquo; */}
                </p>
                <p className="past-results__gratitude-attribution">
                  &ndash; vishnu{" "}
                  <span className="past-results__gratitude-role">
                    (site creator / nine11 / bottler)
                  </span>
                </p>
              </section>

              <section
                className="past-results__credit"
                aria-label="Founder"
              >
                <div className="past-results__credit-inner">
                  <img
                    className="past-results__credit-photo"
                    src="/yukesh.png"
                    alt="Yukesh"
                    loading="lazy"
                    decoding="async"
                  />
                  <blockquote className="past-results__credit-quote">
                    <p>
                      &lsquo;There was an idea. To bring together a group of
                      remarkable people to see if they could become something
                      more.&rsquo;
                    </p>
                    <footer className="past-results__credit-attribution">
                      &ndash; <s>Nick Fury</s> Tukesh{" "}
                      <span className="past-results__credit-role">
                        (Creator of Mass boys auction)
                      </span>
                    </footer>
                  </blockquote>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PastResultsRoot>
  );
}
