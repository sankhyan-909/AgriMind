import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const initialForm = {
  crop: "",
  irrigationDate: "",
  waterSource: "Tube Well",
  quantity: "",
  unit: "litres",
  method: "Drip Irrigation",
  remarks: "",
};

const waterSources = ["Tube Well", "Canal", "Rainwater", "Other"];

const methods = ["Drip Irrigation", "Sprinkler", "Flood"];

const units = ["litres", "gallons"];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonthKey(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMethodClass(method) {
  if (method === "Drip Irrigation") return "amir-method amir-drip";
  if (method === "Sprinkler") return "amir-method amir-sprinkler";
  if (method === "Flood") return "amir-method amir-flood";

  return "amir-method";
}

export default function Irrigation() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function loadRecords() {
    try {
      setLoading(true);
      setError("");

      const response = await get("/irrigation");

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.records || [];

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load irrigation records:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load irrigation records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((record) => {
        if (!query) return true;

        return [
          record.crop,
          record.waterSource,
          record.method,
          record.remarks,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .filter((record) => {
        if (sourceFilter === "All") return true;
        return record.waterSource === sourceFilter;
      })
      .filter((record) => {
        if (!monthFilter) return true;
        return getMonthKey(record.irrigationDate) === monthFilter;
      })
      .sort((a, b) => {
        const first = new Date(a.irrigationDate || 0).getTime();
        const second = new Date(b.irrigationDate || 0).getTime();

        return second - first;
      });
  }, [records, search, monthFilter, sourceFilter]);

  const stats = useMemo(() => {
    const totalRecords = records.length;

    const totalLitres = records.reduce((sum, record) => {
      const quantity = Number(record.quantity) || 0;

      if (String(record.unit).toLowerCase() === "gallons") {
        return sum + quantity * 3.78541;
      }

      return sum + quantity;
    }, 0);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const thisMonth = records.filter(
      (record) => getMonthKey(record.irrigationDate) === currentMonth
    ).length;

    const crops = new Set(
      records
        .map((record) => String(record.crop || "").trim().toLowerCase())
        .filter(Boolean)
    ).size;

    const methodsUsed = new Set(
      records
        .map((record) => String(record.method || "").trim())
        .filter(Boolean)
    ).size;

    return {
      totalRecords,
      totalLitres,
      thisMonth,
      crops,
      methodsUsed,
    };
  }, [records]);

  const sourceBreakdown = useMemo(() => {
    const counts = {};

    records.forEach((record) => {
      const source = record.waterSource || "Other";
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [records]);

  function openCreateForm() {
    setEditingId(null);
    setForm({
      ...initialForm,
      irrigationDate: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(record) {
    setEditingId(record._id || record.id);

    setForm({
      crop: record.crop || "",
      irrigationDate: record.irrigationDate
        ? String(record.irrigationDate).slice(0, 10)
        : "",
      waterSource: record.waterSource || "Tube Well",
      quantity: record.quantity ?? "",
      unit: record.unit || "litres",
      method: record.method || "Drip Irrigation",
      remarks: record.remarks || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.crop.trim()) {
      setError("Please enter the crop name.");
      return;
    }

    if (!form.irrigationDate) {
      setError("Please select an irrigation date.");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) < 0 ||
      Number.isNaN(Number(form.quantity))
    ) {
      setError("Please enter a valid water quantity.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        crop: form.crop.trim(),
        irrigationDate: form.irrigationDate,
        waterSource: form.waterSource,
        quantity: Number(form.quantity),
        unit: form.unit,
        method: form.method,
        remarks: form.remarks.trim(),
      };

      if (editingId) {
        await put(`/irrigation/${editingId}`, payload);
        setSuccess("Irrigation record updated successfully.");
      } else {
        await post("/irrigation", payload);
        setSuccess("Irrigation record added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);

      await loadRecords();
    } catch (err) {
      console.error("Failed to save irrigation record:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save irrigation record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      setError("");
      setSuccess("");

      await del(`/irrigation/${deleteId}`);

      setDeleteId(null);
      setSuccess("Irrigation record deleted successfully.");

      await loadRecords();
    } catch (err) {
      console.error("Failed to delete irrigation record:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete irrigation record."
      );
    }
  }

  function resetFilters() {
    setSearch("");
    setMonthFilter("");
    setSourceFilter("All");
  }

  return (
    <div className="amir-page">
      <div className="amir-container">

        {/* HERO */}
        <section className="amir-hero">
          <div className="amir-hero-content">
            <div className="amir-eyebrow">
              FARM MANAGEMENT • WATER RECORDS
            </div>

            <h1>Irrigation Management</h1>

            <p>
              Track when, where, and how much water your crops receive.
              Keep irrigation records organized for smarter farm management.
            </p>

            <div className="amir-hero-actions">
              <button
                type="button"
                className="amir-primary-btn"
                onClick={openCreateForm}
              >
                <span>＋</span>
                Add Irrigation Record
              </button>

              <div className="amir-hero-mini">
                <span className="amir-water-icon">💧</span>
                <div>
                  <strong>{stats.totalRecords}</strong>
                  <small>Total Records</small>
                </div>
              </div>
            </div>
          </div>

          <div className="amir-hero-visual">
            <div className="amir-water-orbit amir-orbit-one"></div>
            <div className="amir-water-orbit amir-orbit-two"></div>
            <div className="amir-water-drop">💧</div>
            <span className="amir-floating-drop drop-one">💦</span>
            <span className="amir-floating-drop drop-two">💧</span>
            <span className="amir-floating-drop drop-three">💦</span>
          </div>
        </section>

        {/* ALERTS */}
        {error && (
          <div className="amir-alert amir-alert-error">
            <span>⚠️</span>
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="amir-alert amir-alert-success">
            <span>✓</span>
            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="amir-stats">
          <div className="amir-stat-card">
            <div className="amir-stat-icon blue">💧</div>
            <div>
              <span>Total Records</span>
              <strong>{stats.totalRecords}</strong>
              <small>All irrigation entries</small>
            </div>
          </div>

          <div className="amir-stat-card">
            <div className="amir-stat-icon green">🌱</div>
            <div>
              <span>Crops Covered</span>
              <strong>{stats.crops}</strong>
              <small>Unique crops</small>
            </div>
          </div>

          <div className="amir-stat-card">
            <div className="amir-stat-icon cyan">📅</div>
            <div>
              <span>This Month</span>
              <strong>{stats.thisMonth}</strong>
              <small>Irrigation records</small>
            </div>
          </div>

          <div className="amir-stat-card">
            <div className="amir-stat-icon purple">🚿</div>
            <div>
              <span>Water Used</span>
              <strong>
                {stats.totalLitres.toLocaleString("en-IN", {
                  maximumFractionDigits: 1,
                })}
              </strong>
              <small>Approx. litres</small>
            </div>
          </div>
        </section>

        {/* QUICK INSIGHT */}
        <section className="amir-insight-grid">
          <div className="amir-insight-card">
            <div className="amir-section-heading">
              <div>
                <span className="amir-section-kicker">WATER SOURCES</span>
                <h2>Usage Overview</h2>
              </div>

              <span className="amir-heading-icon">🌊</span>
            </div>

            {sourceBreakdown.length === 0 ? (
              <div className="amir-small-empty">
                No irrigation source data yet.
              </div>
            ) : (
              <div className="amir-source-list">
                {sourceBreakdown.map(([source, count]) => {
                  const percentage =
                    stats.totalRecords > 0
                      ? Math.round((count / stats.totalRecords) * 100)
                      : 0;

                  return (
                    <div className="amir-source-row" key={source}>
                      <div className="amir-source-top">
                        <span>{source}</span>
                        <strong>{count}</strong>
                      </div>

                      <div className="amir-progress">
                        <div style={{ width: `${percentage}%` }} />
                      </div>

                      <small>{percentage}% of records</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="amir-tip-card">
            <div className="amir-tip-icon">🌿</div>

            <div>
              <span className="amir-section-kicker">FARM TIP</span>
              <h3>Keep your water records consistent</h3>
              <p>
                Recording the water source, quantity and irrigation method
                makes it easier to understand your crop-management pattern
                over time.
              </p>
            </div>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="amir-record-section">
          <div className="amir-record-header">
            <div>
              <span className="amir-section-kicker">IRRIGATION LOG</span>
              <h2>Your Irrigation Records</h2>
              <p>
                {filteredRecords.length} record
                {filteredRecords.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            <button
              type="button"
              className="amir-outline-btn"
              onClick={openCreateForm}
            >
              ＋ Add Record
            </button>
          </div>

          <div className="amir-filters">
            <div className="amir-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search crop, source, method..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="All">All Water Sources</option>

              {waterSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            />

            {(search || monthFilter || sourceFilter !== "All") && (
              <button
                type="button"
                className="amir-reset-btn"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>

          {/* TABLE */}
          <div className="amir-table-wrapper">
            {loading ? (
              <div className="amir-state">
                <div className="amir-spinner"></div>
                <h3>Loading irrigation records...</h3>
                <p>Fetching your latest farm data.</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="amir-state">
                <div className="amir-empty-icon">💧</div>

                <h3>
                  {records.length === 0
                    ? "No irrigation records yet"
                    : "No matching records"}
                </h3>

                <p>
                  {records.length === 0
                    ? "Start recording your crop irrigation activity."
                    : "Try changing your search or filters."}
                </p>

                {records.length === 0 ? (
                  <button
                    type="button"
                    className="amir-primary-btn"
                    onClick={openCreateForm}
                  >
                    ＋ Add First Record
                  </button>
                ) : (
                  <button
                    type="button"
                    className="amir-outline-btn"
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="amir-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Irrigation Date</th>
                    <th>Water Source</th>
                    <th>Quantity</th>
                    <th>Method</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => {
                    const id = record._id || record.id;

                    return (
                      <tr key={id}>
                        <td>
                          <div className="amir-crop-cell">
                            <div className="amir-crop-avatar">
                              🌱
                            </div>

                            <div>
                              <strong>{record.crop || "Unnamed Crop"}</strong>
                              <small>Crop record</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="amir-date-cell">
                            <strong>
                              {formatDate(record.irrigationDate)}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="amir-source-badge">
                            {record.waterSource || "Other"}
                          </span>
                        </td>

                        <td>
                          <strong className="amir-quantity">
                            {Number(record.quantity || 0).toLocaleString(
                              "en-IN"
                            )}
                          </strong>{" "}
                          <span className="amir-unit">
                            {record.unit || "litres"}
                          </span>
                        </td>

                        <td>
                          <span className={getMethodClass(record.method)}>
                            {record.method || "—"}
                          </span>
                        </td>

                        <td>
                          <div className="amir-remarks">
                            {record.remarks || "No remarks"}
                          </div>
                        </td>

                        <td>
                          <div className="amir-actions">
                            <button
                              type="button"
                              className="amir-action edit"
                              onClick={() => openEditForm(record)}
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="amir-action delete"
                              onClick={() => setDeleteId(id)}
                              title="Delete"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="amir-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="amir-modal">
            <div className="amir-modal-header">
              <div>
                <span className="amir-section-kicker">
                  {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                </span>

                <h2>
                  {editingId
                    ? "Edit Irrigation Record"
                    : "Add Irrigation Record"}
                </h2>

                <p>
                  Record the water application details for your crop.
                </p>
              </div>

              <button
                type="button"
                className="amir-close"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="amir-form-grid">
                <label>
                  <span>Crop *</span>

                  <input
                    name="crop"
                    value={form.crop}
                    onChange={handleChange}
                    placeholder="e.g. Wheat"
                    required
                  />
                </label>

                <label>
                  <span>Irrigation Date *</span>

                  <input
                    type="date"
                    name="irrigationDate"
                    value={form.irrigationDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Water Source</span>

                  <select
                    name="waterSource"
                    value={form.waterSource}
                    onChange={handleChange}
                  >
                    {waterSources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Quantity *</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    required
                  />
                </label>

                <label>
                  <span>Unit</span>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Irrigation Method</span>

                  <select
                    name="method"
                    value={form.method}
                    onChange={handleChange}
                  >
                    {methods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="amir-full">
                  <span>Remarks</span>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Add any additional notes..."
                    rows="4"
                  />
                </label>
              </div>

              <div className="amir-modal-footer">
                <button
                  type="button"
                  className="amir-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="amir-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Record"
                    : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div
          className="amir-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteId(null);
            }
          }}
        >
          <div className="amir-confirm-modal">
            <div className="amir-confirm-icon">🗑</div>

            <h2>Delete this record?</h2>

            <p>
              This irrigation record will be permanently removed from your
              farm records.
            </p>

            <div className="amir-confirm-actions">
              <button
                type="button"
                className="amir-cancel-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="amir-delete-btn"
                onClick={handleDelete}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}