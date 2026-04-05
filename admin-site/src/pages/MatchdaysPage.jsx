import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
  Modal,
  Tag,
  Typography,
} from "antd";
import { apiGet, apiSend } from "../api";
import { useTablePagination } from "../useTablePagination.js";

export default function MatchdaysPage() {
  const { message } = App.useApp();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const [filterLock, setFilterLock] = useState("any");
  const [filterMatchNum, setFilterMatchNum] = useState(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkLocked, setBulkLocked] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const pageResetKey = `${tournamentId ?? ""}|${filterLock}|${filterMatchNum ?? ""}`;
  const pagination = useTablePagination(pageResetKey);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [pageResetKey]);

  useEffect(() => {
    apiGet("/api/tournaments").then(setTournaments).catch(() => {});
  }, []);

  const load = async () => {
    if (!tournamentId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGet(
        `/api/matchdays?tournamentId=${encodeURIComponent(tournamentId)}`
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

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterLock === "locked" && !r.isLocked) return false;
      if (filterLock === "open" && r.isLocked) return false;
      if (
        filterMatchNum != null &&
        Number(r.matchNumber) !== Number(filterMatchNum)
      ) {
        return false;
      }
      return true;
    });
  }, [rows, filterLock, filterMatchNum]);

  const openEdit = (record) => {
    setEditing(record);
    const md =
      record.matchDate && /^\d{4}-\d{2}-\d{2}$/.test(String(record.matchDate).trim())
        ? String(record.matchDate).trim()
        : undefined;
    form.setFieldsValue({
      ...record,
      matchDate: md,
      pointsText: JSON.stringify(
        record.points && typeof record.points === "object"
          ? record.points
          : {},
        null,
        2
      ),
    });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    let points = {};
    if (v.pointsText) {
      try {
        points = JSON.parse(v.pointsText);
      } catch {
        message.error("Points map must be valid JSON");
        return;
      }
    }
    try {
      const payload = {
        matchNumber: v.matchNumber,
        points,
        isLocked: v.isLocked,
      };
      if (v.matchDate != null && String(v.matchDate).trim() !== "") {
        payload.matchDate = String(v.matchDate).trim();
      } else {
        payload.matchDate = null;
      }
      await apiSend(
        "PUT",
        `/api/matchdays/${editing._id}?tournamentId=${encodeURIComponent(
          editing.tournamentId
        )}`,
        payload
      );
      message.success("Matchday updated");
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    }
  };

  const remove = (record) => {
    Modal.confirm({
      title: `Delete matchday ${record._id}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await apiSend(
            "DELETE",
            `/api/matchdays/${record._id}?tournamentId=${encodeURIComponent(
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
    if (!tournamentId || selectedRowKeys.length === 0) {
      message.warning("Select tournament and rows");
      return;
    }
    setBulkLocked(false);
    setBulkOpen(true);
  };

  const submitBulk = async () => {
    if (!tournamentId || selectedRowKeys.length === 0) return;
    setBulkSubmitting(true);
    try {
      const out = await apiSend("POST", "/api/matchdays/bulk-update", {
        tournamentId,
        matchdayIds: selectedRowKeys,
        isLocked: bulkLocked,
      });
      message.success(
        `Updated ${out.modified ?? out.matched ?? selectedRowKeys.length} matchday(s)`
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
    { title: "ID", dataIndex: "_id", key: "_id", width: 160, ellipsis: true },
    { title: "Match", dataIndex: "matchNumber", key: "m", width: 72 },
    {
      title: "Match date",
      dataIndex: "matchDate",
      key: "md",
      width: 118,
      render: (v) =>
        v != null && String(v).trim() !== "" ? String(v).trim() : "—",
    },
    {
      title: "Fixture",
      key: "fx",
      width: 120,
      ellipsis: true,
      render: (_, r) =>
        Array.isArray(r.matchTeams) && r.matchTeams.length === 2
          ? `${r.matchTeams[0]} v ${r.matchTeams[1]}`
          : "—",
    },
    {
      title: "Lock",
      dataIndex: "isLocked",
      key: "l",
      width: 88,
      render: (v) =>
        v ? <Tag color="red">Locked</Tag> : <Tag color="green">Open</Tag>,
    },
    {
      title: "Owner pts (preview)",
      key: "p",
      ellipsis: true,
      render: (_, r) => {
        const pts = r.points || {};
        const s = JSON.stringify(pts);
        return s.length > 80 ? `${s.slice(0, 80)}…` : s;
      },
    },
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

  return (
    <Card title="Matchdays">
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
        <Button onClick={load} loading={loading}>
          Refresh
        </Button>
      </Space>
      <Space className="admin-page-toolbar mt-2 mb-2" wrap align="center">
        <Select
          className="min-w-[120px]"
          value={filterLock}
          onChange={setFilterLock}
          disabled={!tournamentId}
          options={[
            { value: "any", label: "Lock: any" },
            { value: "locked", label: "Locked" },
            { value: "open", label: "Open" },
          ]}
        />
        <Space align="center">
          <Typography.Text type="secondary">Match #</Typography.Text>
          <InputNumber
            min={1}
            placeholder="Any"
            className="min-w-[88px]"
            value={filterMatchNum}
            onChange={(v) => setFilterMatchNum(v ?? undefined)}
            disabled={!tournamentId}
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
          Bulk lock ({selectedRowKeys.length})
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
        title="Bulk set lock on matchdays"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={submitBulk}
        confirmLoading={bulkSubmitting}
        okText="Apply"
      >
        <Typography.Paragraph type="secondary">
          Selected: {selectedRowKeys.length} matchday row(s).
        </Typography.Paragraph>
        <Space align="center">
          <Typography.Text strong>Locked</Typography.Text>
          <Switch checked={bulkLocked} onChange={setBulkLocked} />
          <Typography.Text type="secondary">
            {bulkLocked ? "Yes (locked)" : "No (open)"}
          </Typography.Text>
        </Space>
      </Modal>

      <Modal
        title="Edit matchday"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-2 admin-form-spaced">
          <Form.Item name="matchNumber" label="Match number" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item
            name="matchDate"
            label="Match date"
            extra="Calendar day for this fixture. Clear the field and save to remove the date."
          >
            <Input type="date" className="matchdays-modal-date-input" />
          </Form.Item>
          <Form.Item name="isLocked" label="Locked" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="pointsText"
            label="Owner points map JSON (ownerId → number)"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
