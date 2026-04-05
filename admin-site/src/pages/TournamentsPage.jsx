import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { apiGet, apiSend } from "../api";
import { useTablePagination } from "../useTablePagination.js";

const DEFAULT_STAGES = [
  { key: "league", label: "League Stage", count: 35 },
  { key: "league2", label: "Half way", count: 35 },
  { key: "playoffs", label: "Playoffs", count: 4 },
];

export default function TournamentsPage() {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const [filterName, setFilterName] = useState("");
  const [filterActive, setFilterActive] = useState("any");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkActive, setBulkActive] = useState(true);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const pageResetKey = `${filterName}|${filterActive}`;
  const pagination = useTablePagination(pageResetKey, 12);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [pageResetKey]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/api/tournaments");
      setRows(data);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const nm = (r.name || "").toLowerCase();
        const id = (r._id || "").toLowerCase();
        if (!nm.includes(q) && !id.includes(q)) return false;
      }
      if (filterActive === "yes" && r.isActive === false) return false;
      if (filterActive === "no" && r.isActive !== false) return false;
      return true;
    });
  }, [rows, filterName, filterActive]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      boostersText: "[]",
      theme: { primaryColor: "#1677ff", secondaryColor: "#000000" },
      teams: [],
      matches: { total: 74, stages: DEFAULT_STAGES },
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    const legacyTotal = record.totalMatches;
    const matches =
      record.matches && typeof record.matches.total === "number"
        ? {
            total: record.matches.total,
            stages:
              Array.isArray(record.matches.stages) &&
              record.matches.stages.length > 0
                ? record.matches.stages
                : DEFAULT_STAGES,
          }
        : {
            total: legacyTotal ?? 74,
            stages: DEFAULT_STAGES,
          };
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      teams: record.teams?.length ? record.teams : [],
      matches,
      isActive: record.isActive !== false,
      theme: record.theme || {
        primaryColor: "#1677ff",
        secondaryColor: "#000000",
      },
      boostersText: JSON.stringify(record.boosters || [], null, 2),
    });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    let boosters = [];
    if (v.boostersText) {
      try {
        boosters = JSON.parse(v.boostersText);
      } catch {
        message.error("Boosters must be valid JSON array");
        return;
      }
    }
    const stages = (v.matches?.stages || []).filter(
      (s) => s && (s.label || s.count != null)
    );
    const sum = stages.reduce((a, s) => a + (Number(s.count) || 0), 0);
    const total = Number(v.matches?.total);
    if (sum !== total) {
      message.error(
        `Stage counts (${sum}) must equal matches.total (${total}). Adjust rows or total.`
      );
      return;
    }
    const body = {
      name: v.name,
      type: v.type,
      isActive: Boolean(v.isActive),
      teams: v.teams || [],
      matches: {
        total,
        stages: stages.map((s) => ({
          key: (s.key || "").trim(),
          label: (s.label || "").trim(),
          count: Number(s.count) || 0,
        })),
      },
      theme: v.theme,
      boosters,
    };
    try {
      if (editing) {
        await apiSend("PUT", `/api/tournaments/${editing._id}`, body);
        message.success("Tournament updated");
      } else {
        await apiSend("POST", "/api/tournaments", { ...body, _id: v._id });
        message.success("Tournament created");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    }
  };

  const remove = async (record) => {
    Modal.confirm({
      title: `Delete tournament ${record._id}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await apiSend("DELETE", `/api/tournaments/${record._id}`);
          message.success("Deleted");
          load();
        } catch (e) {
          message.error(e.message);
        }
      },
    });
  };

  const openBulk = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Select at least one tournament");
      return;
    }
    setBulkActive(true);
    setBulkOpen(true);
  };

  const submitBulk = async () => {
    if (selectedRowKeys.length === 0) return;
    setBulkSubmitting(true);
    try {
      const out = await apiSend("POST", "/api/tournaments/bulk-update", {
        tournamentIds: selectedRowKeys,
        isActive: bulkActive,
      });
      message.success(
        `Updated ${out.modified ?? out.matched ?? selectedRowKeys.length} tournament(s)`
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
    { title: "ID", dataIndex: "_id", key: "_id", width: 120 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type", width: 100 },
    {
      title: "Matches",
      key: "tm",
      width: 72,
      render: (_, r) => r.matches?.total ?? r.totalMatches ?? "—",
    },
    {
      title: "Teams",
      key: "teams",
      width: 72,
      render: (_, r) => (Array.isArray(r.teams) ? r.teams.length : 0),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "act",
      width: 88,
      render: (v) =>
        v !== false ? (
          <Tag color="green">Yes</Tag>
        ) : (
          <Tag>No</Tag>
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
    <Card title="Tournaments">
      <Alert
        type="info"
        showIcon
        className="admin-page-alert"
        title="Tournament id is the URL slug (set at create). Stage ring counts must sum to matches total."
      />
      <Space className="admin-page-toolbar" wrap>
        <Button type="primary" onClick={openCreate}>
          New tournament
        </Button>
        <Button onClick={load} loading={loading}>
          Refresh
        </Button>
      </Space>
      <Space className="admin-page-toolbar admin-page-toolbar--tight-top" wrap>
        <Input
          allowClear
          placeholder="Filter name or id…"
          className="min-w-[200px]"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <Select
          className="min-w-[130px]"
          value={filterActive}
          onChange={setFilterActive}
          options={[
            { value: "any", label: "Active: any" },
            { value: "yes", label: "Active yes" },
            { value: "no", label: "Active no" },
          ]}
        />
        <Button
          disabled={filteredRows.length === 0}
          onClick={() => setSelectedRowKeys(filteredRows.map((r) => r._id))}
        >
          Select all filtered ({filteredRows.length})
        </Button>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => setSelectedRowKeys([])}>
          Clear selection
        </Button>
        <Button
          type="primary"
          disabled={selectedRowKeys.length === 0}
          onClick={openBulk}
        >
          Bulk active ({selectedRowKeys.length})
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
        title="Bulk set tournament active"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={submitBulk}
        confirmLoading={bulkSubmitting}
        okText="Apply"
      >
        <Typography.Paragraph type="secondary">
          Selected: {selectedRowKeys.length} tournament(s).
        </Typography.Paragraph>
        <Space align="center">
          <Typography.Text strong>Active</Typography.Text>
          <Switch checked={bulkActive} onChange={setBulkActive} />
        </Space>
      </Modal>

      <Modal
        title={editing ? "Edit tournament" : "Create tournament"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={720}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-2 admin-form-spaced tournaments-page-form"
        >
          {!editing && (
            <Form.Item
              name="_id"
              label="Tournament id (slug)"
              rules={[{ required: true }]}
            >
              <Input placeholder="ipl26" autoComplete="off" />
            </Form.Item>
          )}
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Input placeholder="auction" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            tooltip="Frontend can use this to pick which tournament to show by default."
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="teams"
            label="Teams (short codes: CSK, RCB, … — type and Enter)"
            tooltip="Used for filters and future auction-site team pickers."
          >
            <Select
              mode="tags"
              placeholder="Add team codes"
              tokenSeparators={[","]}
            />
          </Form.Item>

          <Form.Item
            name={["matches", "total"]}
            label="Matches total (max match number in this tournament)"
            rules={[{ required: true, message: "Enter total matches" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Stages (outer chart ring — counts must sum to total)"
            styles={{ label: { paddingBottom: 10 } }}
          >
            <Form.List name={["matches", "stages"]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 14 }}
                      align="baseline"
                      size={12}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "key"]}
                      >
                        <Input placeholder="key (optional)" style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "label"]}
                        rules={[{ required: true, message: "Label" }]}
                      >
                        <Input placeholder="Label" style={{ width: 160 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "count"]}
                        rules={[{ required: true, message: "Count" }]}
                      >
                        <InputNumber min={0} placeholder="Count" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ key: "", label: "", count: 0 })}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add stage
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            label="Primary color"
            name={["theme", "primaryColor"]}
            rules={[{ required: true, message: "Pick a primary color" }]}
            getValueFromEvent={(color) =>
              color && typeof color.toHexString === "function"
                ? color.toHexString()
                : color
            }
          >
            <ColorPicker showText format="hex" />
          </Form.Item>
          <Form.Item
            label="Secondary color"
            name={["theme", "secondaryColor"]}
            rules={[{ required: true, message: "Pick a secondary color" }]}
            getValueFromEvent={(color) =>
              color && typeof color.toHexString === "function"
                ? color.toHexString()
                : color
            }
          >
            <ColorPicker showText format="hex" />
          </Form.Item>
          <Form.Item
            name="boostersText"
            label='Boosters JSON (e.g. [{"name":"captain","multiplier":2}])'
          >
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
