import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { apiGet, apiSend } from "../api";

/** Local calendar date YYYY-MM-DD (for matchDate picker default). */
function localDateYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildPlayersQuery(tournamentId, team1, team2) {
  const sp = new URLSearchParams();
  sp.set("tournamentId", tournamentId);
  if (team1) sp.append("teams", team1);
  if (team2) sp.append("teams", team2);
  return `/api/players?${sp.toString()}`;
}

/** Match IPL feed row to roster row: normalized name + team short code. */
function normalizePlayerKey(name, teamCode) {
  const n = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
  const t = String(teamCode || "")
    .trim()
    .toUpperCase();
  return `${n}|${t}`;
}

function buildIplPointMap(iplPlayers) {
  const m = new Map();
  for (const p of iplPlayers) {
    const key = normalizePlayerKey(p.name, p.teamShortName);
    m.set(key, p.gamedayPoints);
  }
  return m;
}

export default function UpdateMatchPage() {
  const { message } = App.useApp();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState();
  const [matchNumber, setMatchNumber] = useState(1);
  const [team1, setTeam1] = useState();
  const [team2, setTeam2] = useState();
  const [players, setPlayers] = useState([]);
  const [points, setPoints] = useState({});
  const [matchday, setMatchday] = useState(null);
  const [matchDateStr, setMatchDateStr] = useState(localDateYYYYMMDD);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ownerNameById, setOwnerNameById] = useState({});
  const [iplCookie, setIplCookie] = useState("");
  const [iplAnnouncedVersion, setIplAnnouncedVersion] = useState("");
  const [iplLoading, setIplLoading] = useState(false);
  const [iplSummary, setIplSummary] = useState(null);

  const tournamentMeta = useMemo(
    () => tournaments.find((t) => t._id === tournamentId),
    [tournaments, tournamentId]
  );
  const franchiseOptions = useMemo(
    () =>
      Array.isArray(tournamentMeta?.teams)
        ? tournamentMeta.teams.filter(Boolean)
        : [],
    [tournamentMeta]
  );

  useEffect(() => {
    apiGet("/api/tournaments")
      .then(setTournaments)
      .catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    if (!tournamentId) {
      setOwnerNameById({});
      return;
    }
    apiGet(`/api/owners?tournamentId=${encodeURIComponent(tournamentId)}`)
      .then((list) => {
        const m = {};
        for (const o of list) m[o._id] = o.name;
        setOwnerNameById(m);
      })
      .catch(() => setOwnerNameById({}));
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId || !matchNumber) {
      setMatchday(null);
      setPlayers([]);
      setPoints({});
      setTeam1(undefined);
      setTeam2(undefined);
      return;
    }
    setPlayers([]);
    setPoints({});
    let cancelled = false;
    apiGet(
      `/api/matchdays?tournamentId=${encodeURIComponent(tournamentId)}`
    ).then((rows) => {
      if (cancelled) return;
      const md = rows.find((m) => m.matchNumber === Number(matchNumber));
      setMatchday(md || null);
      if (md?.matchDate && /^\d{4}-\d{2}-\d{2}$/.test(String(md.matchDate))) {
        setMatchDateStr(String(md.matchDate).trim());
      } else {
        setMatchDateStr(localDateYYYYMMDD());
      }
      if (md?.matchTeams?.length === 2) {
        setTeam1(md.matchTeams[0]);
        setTeam2(md.matchTeams[1]);
      } else {
        setTeam1(undefined);
        setTeam2(undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tournamentId, matchNumber]);

  const loadRoster = async () => {
    if (!tournamentId) return;
    if (!team1 || !team2) {
      message.warning("Select both teams for this fixture");
      return;
    }
    if (team1 === team2) {
      message.warning("Teams must be different");
      return;
    }
    setLoading(true);
    try {
      const list = await apiGet(buildPlayersQuery(tournamentId, team1, team2));
      setPlayers(list);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!players.length) return;
    const key = String(matchNumber);
    const next = {};
    for (const p of players) {
      const slot = p.points?.[key];
      if (slot && typeof slot.base === "number") {
        next[p._id] = slot.base;
      } else if (p.ownerId === "unsold") {
        next[p._id] = 0;
      } else {
        next[p._id] = undefined;
      }
    }
    setPoints(next);
  }, [matchNumber, players]);

  useEffect(() => {
    setIplSummary(null);
  }, [players, matchNumber, tournamentId]);

  const payloadPlayers = useMemo(() => {
    return Object.entries(points)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([playerId, basePoints]) => ({
        playerId,
        basePoints: Number(basePoints),
      }));
  }, [points]);

  const runUpdate = async (partial) => {
    if (!tournamentId || !matchNumber) return;
    if (payloadPlayers.length === 0) {
      return;
    }
    if (!team1 || !team2 || team1 === team2) {
      message.warning(
        "Select two different teams so this fixture is stored on the matchday"
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiSend("POST", "/api/match/updateMatch", {
        tournamentId,
        matchNumber: Number(matchNumber),
        players: payloadPlayers,
        partial,
        matchTeams: [team1, team2],
        matchDate: matchDateStr,
      });
      message.success(partial ? "Partial save done" : "Saved & locked");
      const rows = await apiGet(
        `/api/matchdays?tournamentId=${encodeURIComponent(tournamentId)}`
      );
      const md = rows.find((m) => m.matchNumber === Number(matchNumber));
      setMatchday(md || null);
      await loadRoster();
    } catch (e) {
      message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchIplAndFill = async () => {
    if (!players.length) {
      message.warning(
        "Load roster first: pick two teams and click Load roster."
      );
      return;
    }
    if (!iplCookie.trim() || !iplAnnouncedVersion.trim()) {
      message.warning("Paste the cookie header and announcedVersion.");
      return;
    }
    setIplLoading(true);
    try {
      const { players: iplList } = await apiSend(
        "POST",
        "/api/ipl-fantasy/gameday-players",
        {
          cookie: iplCookie.trim(),
          announcedVersion: iplAnnouncedVersion.trim(),
          gamedayId: Number(matchNumber),
        }
      );
      const map = buildIplPointMap(iplList);
      const unmatched = [];
      for (const r of players) {
        const key = normalizePlayerKey(r.name, r.teamCode);
        if (!map.has(key)) {
          unmatched.push(`${r.name} (${r.teamCode || "?"})`);
        }
      }
      setPoints((prev) => {
        const next = { ...prev };
        for (const r of players) {
          const key = normalizePlayerKey(r.name, r.teamCode);
          if (map.has(key)) next[r._id] = map.get(key);
        }
        return next;
      });
      const matched = players.length - unmatched.length;
      setIplSummary({ matched, total: players.length, unmatched });
      message.success(
        `Filled ${matched} / ${players.length} players (IPL gameday ${matchNumber}).`
      );
    } catch (e) {
      message.error(e.message);
      setIplSummary(null);
    } finally {
      setIplLoading(false);
    }
  };

  const unlock = async () => {
    if (!tournamentId || !matchNumber) return;
    setSubmitting(true);
    try {
      await apiSend("PATCH", "/api/match/unlock", {
        tournamentId,
        matchNumber: Number(matchNumber),
      });
      message.success("Unlocked");
      const rows = await apiGet(
        `/api/matchdays?tournamentId=${encodeURIComponent(tournamentId)}`
      );
      const md = rows.find((m) => m.matchNumber === Number(matchNumber));
      setMatchday(md || null);
    } catch (e) {
      message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lock = async () => {
    if (!tournamentId || !matchNumber) return;
    setSubmitting(true);
    try {
      await apiSend("PATCH", "/api/match/lock", {
        tournamentId,
        matchNumber: Number(matchNumber),
      });
      message.success("Locked");
      const rows = await apiGet(
        `/api/matchdays?tournamentId=${encodeURIComponent(tournamentId)}`
      );
      const md = rows.find((m) => m.matchNumber === Number(matchNumber));
      setMatchday(md || null);
    } catch (e) {
      message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Player",
      dataIndex: "name",
      key: "name",
      width: "28%",
      ellipsis: true,
      sorter: (a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), undefined, {
          sensitivity: "base",
        }),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: { title: "Sort by name" },
    },
    {
      title: "Base pts",
      key: "base",
      width: "20%",
      render: (_, record) => (
        <InputNumber
          className="update-match-base-input"
          size="small"
          step={0.01}
          value={points[record._id]}
          onChange={(v) =>
            setPoints((prev) => ({ ...prev, [record._id]: v }))
          }
        />
      ),
    },
    {
      title: "Owner",
      key: "owner",
      width: "22%",
      ellipsis: true,
      render: (_, p) =>
        ownerNameById[p.ownerId] || p.owner || p.ownerId || "—",
    },
    {
      title: "Team",
      dataIndex: "teamCode",
      key: "teamCode",
      width: "10%",
      ellipsis: true,
      render: (v, p) => v || p.team || "—",
    },
    {
      title: "Booster",
      dataIndex: "boosterTag",
      key: "boosterTag",
      width: "12%",
      ellipsis: true,
    },
  ];

  const locked = Boolean(matchday?.isLocked);

  const fixtureDisplay =
    team1 && team2
      ? `${team1} v ${team2}`
      : matchday?.matchTeams?.length === 2
        ? `${matchday.matchTeams[0]} v ${matchday.matchTeams[1]}`
        : null;

  return (
    <Card title="Update match points">
      <div className="update-match-stack">
        <Typography.Text type="secondary">
          Pick the two franchises playing this match, then load roster (only those
          squads). Use <strong>Full save</strong> to write owner totals, store the
          fixture on the matchday, and lock. Unlock to correct players, then{" "}
          <strong>Partial save</strong> (or lock again when done).
        </Typography.Text>

        <Form layout="inline" className="update-match-controls">
          <Form.Item label="Tournament">
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Tournament"
              className="min-w-[200px]"
              value={tournamentId}
              onChange={(v) => {
                setTournamentId(v);
              }}
              options={tournaments.map((t) => ({
                value: t._id,
                label: `${t.name} (${t._id})`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Match #">
            <InputNumber
              min={1}
              value={matchNumber}
              onChange={(v) => setMatchNumber(v ?? 1)}
            />
          </Form.Item>
          <Form.Item label="Match date">
            <input
              type="date"
              className="update-match-date-input"
              value={matchDateStr}
              onChange={(e) => setMatchDateStr(e.target.value)}
              disabled={locked}
              aria-label="Match calendar date"
            />
          </Form.Item>
          <Form.Item label="Team 1">
            <Select
              showSearch
              allowClear
              placeholder="Franchise"
              className="min-w-[120px]"
              disabled={
                !tournamentId || franchiseOptions.length === 0 || locked
              }
              value={team1}
              onChange={(v) => {
                setTeam1(v);
                if (v && v === team2) setTeam2(undefined);
              }}
              options={franchiseOptions.map((code) => ({
                value: code,
                label: code,
              }))}
            />
          </Form.Item>
          <Form.Item label="Team 2">
            <Select
              showSearch
              allowClear
              placeholder="Franchise"
              className="min-w-[120px]"
              disabled={
                !tournamentId || franchiseOptions.length === 0 || locked
              }
              value={team2}
              onChange={(v) => {
                setTeam2(v);
                if (v && v === team1) setTeam1(undefined);
              }}
              options={franchiseOptions
                .filter((code) => code !== team1)
                .map((code) => ({ value: code, label: code }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={loadRoster} loading={loading}>
              Load roster
            </Button>
          </Form.Item>
        </Form>
        {tournamentId && franchiseOptions.length === 0 ? (
          <Typography.Text type="warning">
            This tournament has no team codes yet — add them under Tournaments
            before scoring a fixture.
          </Typography.Text>
        ) : null}

        <Card
          size="small"
          title="Import from IPL fantasy (My11Circle)"
          className="update-match-ipl-card"
        >
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Uses the same feed as the stats site. Paste the full{" "}
            <strong>cookie</strong> request header and{" "}
            <strong>announcedVersion</strong> from DevTools (Network →
            gamedayplayers). <strong>Gameday</strong> is the current{" "}
            <strong>Match #</strong>. Rows are matched by player name + franchise
            code (e.g. MI, CSK) — fix spelling in Players if a row does not fill.
          </Typography.Paragraph>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Typography.Text>announcedVersion</Typography.Text>
              <Input
                placeholder="e.g. 04052026093708"
                value={iplAnnouncedVersion}
                onChange={(e) => setIplAnnouncedVersion(e.target.value)}
                style={{ marginTop: 4 }}
                allowClear
              />
            </div>
            <div>
              <Typography.Text>Cookie (request header value)</Typography.Text>
              <Input.TextArea
                placeholder="my11c-uid=…; my11c-authToken=…; …"
                value={iplCookie}
                onChange={(e) => setIplCookie(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 5 }}
                style={{ marginTop: 4, fontFamily: "monospace", fontSize: 12 }}
              />
            </div>
            <div>
              <Button
                type="primary"
                onClick={fetchIplAndFill}
                loading={iplLoading}
                disabled={!tournamentId}
              >
                Fetch IPL points &amp; fill base pts
              </Button>
              <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                Match # = {matchNumber} (gameday ID)
              </Typography.Text>
            </div>
            {iplSummary ? (
              <Alert
                type={iplSummary.unmatched.length ? "warning" : "success"}
                showIcon
                message={`Matched ${iplSummary.matched} of ${iplSummary.total} roster players`}
                description={
                  iplSummary.unmatched.length ? (
                    <span>
                      Not matched (check name / team code vs IPL):{" "}
                      {iplSummary.unmatched.slice(0, 15).join("; ")}
                      {iplSummary.unmatched.length > 15
                        ? ` … +${iplSummary.unmatched.length - 15} more`
                        : ""}
                    </span>
                  ) : (
                    "All roster players had a matching IPL row."
                  )
                }
              />
            ) : null}
          </Space>
        </Card>

        <Space wrap>
          <span>Status:</span>
          {!matchday ? (
            <Tag>No matchday row yet (first save will create it)</Tag>
          ) : locked ? (
            <Tag color="red">Locked</Tag>
          ) : (
            <Tag color="green">Unlocked</Tag>
          )}
          {fixtureDisplay ? (
            <Tag color="blue">Fixture: {fixtureDisplay}</Tag>
          ) : null}
          <Button onClick={unlock} disabled={!matchday || !locked}>
            Unlock
          </Button>
          <Button onClick={lock} disabled={!matchday || locked}>
            Lock
          </Button>
        </Space>

        <div className="update-match-roster-table">
          <Table
            size="small"
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={players}
            pagination={false}
            tableLayout="fixed"
          />
        </div>

        <Space wrap size={[12, 12]}>
          <Button
            type="primary"
            loading={submitting}
            disabled={payloadPlayers.length === 0 || locked}
            onClick={() => runUpdate(false)}
          >
            Save full (lock)
          </Button>
          <Button
            loading={submitting}
            disabled={payloadPlayers.length === 0 || !matchday || locked}
            onClick={() => runUpdate(true)}
          >
            Save partial (unlocked only)
          </Button>
        </Space>
      </div>
    </Card>
  );
}
