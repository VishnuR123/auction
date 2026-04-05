import { useEffect, useMemo, useState } from "react";
import {
  App,
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Modal,
  Tag,
  Typography,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiGet, apiSend, apiUpload } from "../api";
import { showImportResult } from "../showImportResult.jsx";
import { useTablePagination } from "../useTablePagination.js";

export default function PlayersPage() {
  const { message } = App.useApp();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState();
  const [teamCodes, setTeamCodes] = useState([]);
  const [boosterOptions, setBoosterOptions] = useState([]);
  const [ownersOptions, setOwnersOptions] = useState([]);
  const [ownerNameById, setOwnerNameById] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const [filterTeam, setFilterTeam] = useState();
  const [filterOwner, setFilterOwner] = useState();
  const [filterName, setFilterName] = useState("");
  const [filterInjured, setFilterInjured] = useState("any");
  const [filterEliminated, setFilterEliminated] = useState("any");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkField, setBulkField] = useState("isEliminated");
  const [bulkBool, setBulkBool] = useState(false);
  const [bulkTag, setBulkTag] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const pageResetKey = `${tournamentId ?? ""}|${filterTeam ?? ""}|${filterOwner ?? ""}|${filterName}|${filterInjured}|${filterEliminated}`;
  const pagination = useTablePagination(pageResetKey);

  useEffect(() => {
    apiGet("/api/tournaments").then(setTournaments).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [pageResetKey]);

  useEffect(() => {
    if (!tournamentId) {
      setTeamCodes([]);
      setBoosterOptions([]);
      setOwnersOptions([]);
      setOwnerNameById({});
      return;
    }
    apiGet(`/api/tournaments/${tournamentId}`)
      .then((t) => {
        setTeamCodes(Array.isArray(t.teams) ? t.teams : []);
        setBoosterOptions(
          (t.boosters || []).map((b) => b.name).filter(Boolean)
        );
      })
      .catch(() => {
        setTeamCodes([]);
        setBoosterOptions([]);
      });
    apiGet(`/api/owners?tournamentId=${encodeURIComponent(tournamentId)}`)
      .then((list) => {
        setOwnersOptions(list);
        const m = {};
        for (const o of list) m[o._id] = o.name;
        setOwnerNameById(m);
      })
      .catch(() => {
        setOwnersOptions([]);
        setOwnerNameById({});
      });
  }, [tournamentId]);

  const load = async () => {
    if (!tournamentId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGet(
        `/api/players?tournamentId=${encodeURIComponent(tournamentId)}`
      );
      setRows(data);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tournamentId]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const t = editing?.tournamentId ?? tournamentId;
    if (!t) return;
    apiGet(`/api/tournaments/${t}`)
      .then((doc) => {
        setTeamCodes(Array.isArray(doc.teams) ? doc.teams : []);
        setBoosterOptions(
          (doc.boosters || []).map((b) => b.name).filter(Boolean)
        );
      })
      .catch(() => {
        setTeamCodes([]);
        setBoosterOptions([]);
      });
    apiGet(`/api/owners?tournamentId=${encodeURIComponent(t)}`)
      .then(setOwnersOptions)
      .catch(() => setOwnersOptions([]));
  }, [open, editing, tournamentId]);

  const filteredRows = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterTeam && (r.teamCode ?? r.team) !== filterTeam) return false;
      if (filterOwner && r.ownerId !== filterOwner) return false;
      if (q && !(r.name || "").toLowerCase().includes(q)) return false;
      if (filterInjured === "yes" && !r.isInjured) return false;
      if (filterInjured === "no" && r.isInjured) return false;
      if (filterEliminated === "yes" && !r.isEliminated) return false;
      if (filterEliminated === "no" && r.isEliminated) return false;
      return true;
    });
  }, [
    rows,
    filterTeam,
    filterOwner,
    filterName,
    filterInjured,
    filterEliminated,
  ]);

  const openCreate = () => {
    if (!tournamentId) {
      message.warning("Select a tournament first");
      return;
    }
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      tournamentId,
      isInjured: false,
      isEliminated: false,
      boosterTag: undefined,
    });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      tournamentId: record.tournamentId,
      name: record.name,
      ownerId: record.ownerId,
      teamCode: record.teamCode ?? record.team,
      role: record.role,
      nationality: record.nationality,
      price: record.price,
      boosterTag: record.boosterTag || undefined,
      isInjured: record.isInjured,
      isEliminated: record.isEliminated,
    });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const body = {
      name: v.name,
      tournamentId: v.tournamentId,
      ownerId: v.ownerId,
      teamCode: v.teamCode,
      role: v.role,
      nationality: v.nationality,
      price: v.price,
      boosterTag: v.boosterTag ?? "",
      isInjured: v.isInjured,
      isEliminated: v.isEliminated,
    };
    try {
      if (editing) {
        await apiSend(
          "PUT",
          `/api/players/${editing._id}?tournamentId=${encodeURIComponent(
            editing.tournamentId
          )}`,
          body
        );
        message.success(
          "Player updated (points are unchanged; use Update match to score)"
        );
      } else {
        await apiSend("POST", "/api/players", {
          _id: v._id,
          ...body,
        });
        message.success("Player created");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    }
  };

  const importPlayers = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const data = await apiUpload("/api/import/players", fd);
      showImportResult(data, "Players");
      load();
    } catch (e) {
      message.error(e.message);
    }
    return false;
  };

  const remove = (record) => {
    Modal.confirm({
      title: `Delete player ${record._id}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await apiSend(
            "DELETE",
            `/api/players/${record._id}?tournamentId=${encodeURIComponent(
              record.tournamentId
            )}`
          );
          message.success("Deleted");
          load();
        } catch (e) {
          message.error(e.message);
        }
      },
    });
  };

  const openBulk = () => {
    if (!tournamentId) {
      message.warning("Select a tournament first");
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning("Select at least one row");
      return;
    }
    setBulkField("isEliminated");
    setBulkBool(false);
    setBulkTag("");
    setBulkOpen(true);
  };

  const submitBulk = async () => {
    if (!tournamentId || selectedRowKeys.length === 0) return;
    const updates =
      bulkField === "boosterTag"
        ? { boosterTag: bulkTag || "" }
        : bulkField === "isInjured"
          ? { isInjured: bulkBool }
          : { isEliminated: bulkBool };
    setBulkSubmitting(true);
    try {
      const out = await apiSend("POST", "/api/players/bulk-update", {
        tournamentId,
        playerIds: selectedRowKeys,
        updates,
      });
      message.success(
        `Updated ${out.modified ?? out.matched ?? selectedRowKeys.length} player(s)`
      );
      setBulkOpen(false);
      setSelectedRowKeys([]);
      load();
    } catch (e) {
      message.error(e.message);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    preserveSelectedRowKeys: false,
  };

  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id", width: 120, ellipsis: true },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Owner",
      key: "owner",
      width: 140,
      ellipsis: true,
      render: (_, r) =>
        ownerNameById[r.ownerId] || r.owner || r.ownerId || "—",
    },
    {
      title: "Team",
      dataIndex: "teamCode",
      key: "teamCode",
      width: 80,
      render: (v, r) => v ?? r.team ?? "—",
    },
    {
      title: "Inj",
      key: "inj",
      width: 56,
      render: (_, r) =>
        r.isInjured ? <Tag color="orange">Y</Tag> : <span>—</span>,
    },
    {
      title: "Out",
      key: "el",
      width: 56,
      render: (_, r) =>
        r.isEliminated ? <Tag color="red">Y</Tag> : <span>—</span>,
    },
    { title: "Pts", dataIndex: "totalPoints", key: "tp", width: 72 },
    {
      title: "Actions",
      key: "a",
      width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => remove(r)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const triStateOpts = [
    { value: "any", label: "Any" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Card title="Players (roster & metadata)">
      <Alert
        type="info"
        showIcon
        className="admin-page-alert"
        title="Import owners first, then players. Match points are only from Update match."
      />
      <Typography.Paragraph
        type="secondary"
        style={{ fontSize: 13, marginBottom: 16 }}
      >
        Excel sheet <Typography.Text code>players</Typography.Text> (or first
        sheet): _id, name, tournamentId, ownerId, teamCode, role, nationality,
        price, boosterTag, isInjured, isEliminated.
      </Typography.Paragraph>
      <Space className="admin-page-toolbar" wrap>
        <Select
          showSearch
          placeholder="Tournament"
          className="min-w-[220px]"
          value={tournamentId}
          onChange={setTournamentId}
          options={tournaments.map((t) => ({
            value: t._id,
            label: `${t.name} (${t._id})`,
          }))}
        />
        <Button type="primary" onClick={openCreate} disabled={!tournamentId}>
          New player
        </Button>
        <Button onClick={load} loading={loading}>
          Refresh
        </Button>
        <Upload
          accept=".xlsx,.xls"
          showUploadList={false}
          beforeUpload={importPlayers}
        >
          <Button icon={<UploadOutlined />}>Import Excel</Button>
        </Upload>
      </Space>
      <Space className="admin-page-toolbar admin-page-toolbar--tight-top" wrap align="start">
        <Select
          allowClear
          placeholder="Team"
          className="min-w-[100px]"
          value={filterTeam}
          onChange={setFilterTeam}
          disabled={!tournamentId}
          options={teamCodes.map((code) => ({ value: code, label: code }))}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Owner"
          className="min-w-[180px]"
          value={filterOwner}
          onChange={setFilterOwner}
          disabled={!tournamentId}
          options={ownersOptions.map((o) => ({
            value: o._id,
            label: `${o.name} (${o.shortName})`,
          }))}
        />
        <Input
          allowClear
          placeholder="Name contains…"
          className="min-w-[160px]"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          disabled={!tournamentId}
        />
        <Space align="center" size={8}>
          <Typography.Text type="secondary" className="whitespace-nowrap">
            Injured
          </Typography.Text>
          <Select
            className="min-w-[100px]"
            value={filterInjured}
            onChange={setFilterInjured}
            disabled={!tournamentId}
            options={triStateOpts}
            aria-label="Filter by injured"
          />
        </Space>
        <Space align="center" size={8}>
          <Typography.Text type="secondary" className="whitespace-nowrap">
            Eliminated
          </Typography.Text>
          <Select
            className="min-w-[100px]"
            value={filterEliminated}
            onChange={setFilterEliminated}
            disabled={!tournamentId}
            options={triStateOpts}
            aria-label="Filter by eliminated"
          />
        </Space>
        <Button
          disabled={!tournamentId || filteredRows.length === 0}
          onClick={() => setSelectedRowKeys(filteredRows.map((r) => r._id))}
        >
          Select all filtered ({filteredRows.length})
        </Button>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => setSelectedRowKeys([])}>
          Clear selection
        </Button>
        <Button
          type="primary"
          disabled={!tournamentId || selectedRowKeys.length === 0}
          onClick={openBulk}
        >
          Bulk edit ({selectedRowKeys.length})
        </Button>
      </Space>
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={filteredRows}
        pagination={pagination}
        rowSelection={rowSelection}
      />

      <Modal
        title="Bulk update players"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={submitBulk}
        confirmLoading={bulkSubmitting}
        okText="Apply"
      >
        <Typography.Paragraph type="secondary">
          Applies to {selectedRowKeys.length} selected row(s) in this tournament
          (filtered list).
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Typography.Text strong>Field</Typography.Text>
            <Select
              className="w-full mt-1"
              value={bulkField}
              onChange={(v) => setBulkField(v)}
              options={[
                { value: "isEliminated", label: "Eliminated" },
                { value: "isInjured", label: "Injured" },
                { value: "boosterTag", label: "Booster tag" },
              ]}
            />
          </div>
          {bulkField === "boosterTag" ? (
            <div>
              <Typography.Text strong>Value</Typography.Text>
              <Select
                allowClear
                placeholder="Clear tag (none)"
                className="w-full mt-1"
                value={bulkTag || undefined}
                onChange={(v) => setBulkTag(v ?? "")}
                options={boosterOptions.map((n) => ({ value: n, label: n }))}
              />
            </div>
          ) : (
            <Space align="center">
              <Typography.Text strong>Set to</Typography.Text>
              <Switch checked={bulkBool} onChange={setBulkBool} />
              <Typography.Text type="secondary">
                {bulkBool ? "Yes / true" : "No / false"}
              </Typography.Text>
            </Space>
          )}
        </Space>
      </Modal>

      <Modal
        title={editing ? "Edit player" : "Create player"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={720}
        destroyOnHidden
      >
        {editing && (
          <Typography.Paragraph type="secondary" className="mb-3">
            Total points (read-only):{" "}
            <strong>{editing.totalPoints ?? 0}</strong> — change via Update
            match.
          </Typography.Paragraph>
        )}
        <Form form={form} layout="vertical" className="mt-2 admin-form-spaced">
          {!editing && (
            <Form.Item name="_id" label="Player id" rules={[{ required: true }]}>
              <Input placeholder="player_123" />
            </Form.Item>
          )}
          <Form.Item
            name="tournamentId"
            label="Tournament id"
            rules={[{ required: true }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label="Owner"
            rules={[{ required: true, message: "Select an owner" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select owner"
              options={ownersOptions.map((o) => ({
                value: o._id,
                label: `${o.name} (${o.shortName})`,
              }))}
              dropdownStyle={{ minWidth: 280 }}
            />
          </Form.Item>
          <Form.Item
            name="teamCode"
            label="Team"
            rules={[{ required: true, message: "Select a franchise" }]}
            tooltip="Must be one of the team codes configured on this tournament."
          >
            <Select
              showSearch
              placeholder="Franchise (e.g. CSK)"
              options={teamCodes.map((code) => ({
                value: code,
                label: code,
              }))}
            />
          </Form.Item>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                name="nationality"
                label="Nationality"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="boosterTag"
            label="Booster tag"
            tooltip="Options come from this tournament’s boosters JSON."
          >
            <Select
              allowClear
              placeholder="None"
              options={boosterOptions.map((n) => ({ value: n, label: n }))}
            />
          </Form.Item>
          <Space size="large" style={{ marginTop: 4 }}>
            <Form.Item name="isInjured" label="Injured" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isEliminated" label="Eliminated" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
}
