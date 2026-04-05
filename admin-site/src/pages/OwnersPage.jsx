import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Modal,
  Typography,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiGet, apiSend, apiUpload } from "../api";
import { showImportResult } from "../showImportResult.jsx";
import { useTablePagination } from "../useTablePagination.js";

const colorPickerToHex = (color) =>
  color && typeof color.toHexString === "function"
    ? color.toHexString()
    : color;

export default function OwnersPage() {
  const { message } = App.useApp();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const [filterName, setFilterName] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkField, setBulkField] = useState("primaryColor");
  const [bulkColor, setBulkColor] = useState("#1677ff");
  const [bulkShort, setBulkShort] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const pageResetKey = `${tournamentId ?? ""}|${filterName}`;
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
        `/api/owners?tournamentId=${encodeURIComponent(tournamentId)}`
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
    const q = filterName.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.shortName || "").toLowerCase().includes(q)
    );
  }, [rows, filterName]);

  const openCreate = () => {
    if (!tournamentId) {
      message.warning("Select a tournament first");
      return;
    }
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      tournamentId,
      primaryColor: "#1677ff",
      secondaryColor: "#1f1f1f",
    });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      primaryColor: record.primaryColor ?? record.color,
      secondaryColor: record.secondaryColor,
    });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const body = {
      ...v,
      primaryColor: v.primaryColor,
      secondaryColor: v.secondaryColor,
    };
    delete body.color;
    try {
      if (editing) {
        await apiSend("PUT", `/api/owners/${editing._id}`, body);
        message.success("Owner updated");
      } else {
        await apiSend("POST", "/api/owners", body);
        message.success("Owner created");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    }
  };

  const importOwners = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const data = await apiUpload("/api/import/owners", fd);
      showImportResult(data, "Owners");
      load();
    } catch (e) {
      message.error(e.message);
    }
    return false;
  };

  const remove = (record) => {
    Modal.confirm({
      title: `Delete owner ${record._id}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await apiSend("DELETE", `/api/owners/${record._id}`);
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
      message.warning("Select a tournament and at least one row");
      return;
    }
    setBulkField("primaryColor");
    setBulkColor("#1677ff");
    setBulkShort("");
    setBulkOpen(true);
  };

  const submitBulk = async () => {
    if (!tournamentId || selectedRowKeys.length === 0) return;
    const updates =
      bulkField === "shortName"
        ? { shortName: bulkShort.trim() }
        : { [bulkField]: bulkColor };
    if (bulkField === "shortName" && !updates.shortName) {
      message.error("Enter a short name");
      return;
    }
    setBulkSubmitting(true);
    try {
      const out = await apiSend("POST", "/api/owners/bulk-update", {
        tournamentId,
        ownerIds: selectedRowKeys,
        updates,
      });
      message.success(
        `Updated ${out.modified ?? out.matched ?? selectedRowKeys.length} owner(s)`
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

  const swatch = (hex) => (
    <span
      style={{
        display: "inline-block",
        width: 22,
        height: 22,
        borderRadius: 4,
        background: hex || "#333",
        border: "1px solid rgba(255,255,255,0.2)",
        verticalAlign: "middle",
      }}
    />
  );

  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id", width: 140, ellipsis: true },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Short", dataIndex: "shortName", key: "s", width: 80 },
    {
      title: "Colors",
      key: "colors",
      width: 100,
      render: (_, r) => (
        <Space size={8}>
          {swatch(r.primaryColor ?? r.color)}
          {swatch(r.secondaryColor)}
        </Space>
      ),
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
    <Card title="Owners">
      <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
        Excel: sheet named <Typography.Text code>owners</Typography.Text> (or first
        sheet). Columns: _id, tournamentId, name, shortName, primaryColor,
        secondaryColor.
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
          New owner
        </Button>
        <Button onClick={load} loading={loading}>
          Refresh
        </Button>
        <Upload
          accept=".xlsx,.xls"
          showUploadList={false}
          beforeUpload={importOwners}
        >
          <Button icon={<UploadOutlined />}>Import Excel</Button>
        </Upload>
      </Space>
      <Space className="admin-page-toolbar mt-2 mb-2" wrap>
        <Input
          allowClear
          placeholder="Filter name / short…"
          className="min-w-[200px]"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          disabled={!tournamentId}
        />
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
        title="Bulk update owners"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={submitBulk}
        confirmLoading={bulkSubmitting}
        okText="Apply"
      >
        <Typography.Paragraph type="secondary">
          One field per apply. Selected: {selectedRowKeys.length}.
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Select
            className="w-full"
            value={bulkField}
            onChange={setBulkField}
            options={[
              { value: "primaryColor", label: "Primary color" },
              { value: "secondaryColor", label: "Secondary color" },
              { value: "shortName", label: "Short name" },
            ]}
          />
          {bulkField === "shortName" ? (
            <Input
              placeholder="Short name"
              value={bulkShort}
              onChange={(e) => setBulkShort(e.target.value)}
            />
          ) : (
            <ColorPicker
              showText
              format="hex"
              value={bulkColor}
              onChange={(c) => setBulkColor(colorPickerToHex(c))}
            />
          )}
        </Space>
      </Modal>

      <Modal
        title={editing ? "Edit owner" : "Create owner"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={560}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-2 admin-form-spaced"
        >
          {!editing && (
            <Form.Item name="_id" label="Owner id" rules={[{ required: true }]}>
              <Input placeholder="vishnu_ipl26" />
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
          <Form.Item name="shortName" label="Short name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="primaryColor"
            label="Primary color"
            rules={[{ required: true, message: "Pick a primary color" }]}
            getValueFromEvent={colorPickerToHex}
          >
            <ColorPicker showText format="hex" />
          </Form.Item>
          <Form.Item
            name="secondaryColor"
            label="Secondary color"
            rules={[{ required: true, message: "Pick a secondary color" }]}
            getValueFromEvent={colorPickerToHex}
          >
            <ColorPicker showText format="hex" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
