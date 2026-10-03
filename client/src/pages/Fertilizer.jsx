import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const EMPTY_FORM = {
  fertilizerName: "",
  quantity: "",
  applicationDate: "",
  remarks: "",
};

export default function Fertilizer() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await get("/fertilizer");

      const data = Array.isArray(response)
        ? response
        : response?.fertilizers ||
          response?.records ||
          response?.data ||
          response?.items ||
          [];

      setRecords(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load fertilizer records.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (record) => {
    setForm({
      fertilizerName: record.fertilizerName || "",
      quantity: record.quantity ?? "",
      applicationDate: record.applicationDate || "",
      remarks: record.remarks || "",
    });

    setEditingId(record._id || record.id);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fertilizerName.trim()) {
      setError("Please enter the fertilizer name.");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) < 0 ||
      Number.isNaN(Number(form.quantity))
    ) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!form.applicationDate) {
      setError("Please select the application date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        fertilizerName: form.fertilizerName.trim(),
        quantity: Number(form.quantity),
        applicationDate: form.applicationDate,
        remarks: form.remarks.trim(),
      };

      if (editingId) {
        await put(`/fertilizer/${editingId}`, payload);
        setSuccess("Fertilizer record updated successfully.");
      } else {
        await post("/fertilizer", payload);
        setSuccess("Fertilizer record added successfully.");
      }

      closeForm();
      await loadRecords();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save fertilizer record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fertilizer record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await del(`/fertilizer/${id}`);

      setRecords((previous) =>
        previous.filter((item) => (item._id || item.id) !== id)
      );

      setSuccess("Fertilizer record deleted successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete fertilizer record."
      );
    }
  };

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const name = String(record.fertilizerName || "").toLowerCase();
        const remarks = String(record.remarks || "").toLowerCase();

        const matchesSearch =
          !query ||
          name.includes(query) ||
          remarks.includes(query);

        const date = String(record.applicationDate || "");

        const matchesMonth =
          monthFilter === "All" ||
          date.startsWith(monthFilter);

        return matchesSearch && matchesMonth;
      })
      .sort((a, b) => {
        const first = new Date(a.applicationDate || 0).getTime();
        const second = new Date(b.applicationDate || 0).getTime();

        return second - first;
      });
  }, [records, search, monthFilter]);

  const stats = useMemo(() => {
    const totalQuantity = records.reduce(
      (sum, record) => sum + (Number(record.quantity) || 0),
      0
    );

    const applications = records.length;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const thisMonth = records.filter((record) =>
      String(record.applicationDate || "").startsWith(currentMonth)
    ).length;

    const fertilizerTypes = new Set(
      records
        .map((record) =>
          String(record.fertilizerName || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    ).size;

    return {
      applications,
      totalQuantity,
      thisMonth,
      fertilizerTypes,
    };
  }, [records]);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const monthOptions = useMemo(() => {
    const values = new Set();

    records.forEach((record) => {
      if (record.applicationDate) {
        values.add(String(record.applicationDate).slice(0, 7));
      }
    });

    return Array.from(values).sort().reverse();
  }, [records]);

  const formatMonth = (value) => {
    if (!value) return value;

    const date = new Date(`${value}-01`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="amf-page">
      <div className="amf-shell">

        {/* HERO */}
        <section className="amf-hero">
          <div className="amf-hero-content">

            <div className="amf-eyebrow">
              <span>🧪</span>
              FERTILIZER MANAGEMENT
            </div>

            <h1>Feed your crops right.</h1>

            <p>
              Keep a clear record of fertilizer applications, quantities
              and field notes so every crop gets the care it needs.
            </p>

            <button
              className="amf-primary-btn"
              onClick={openCreate}
            >
              <span>＋</span>
              Add Application
            </button>

          </div>

          <div className="amf-hero-art">

            <div className="amf-leaf leaf-one">🌿</div>
            <div className="amf-leaf leaf-two">🌱</div>

            <div className="amf-bottle">
              <div className="amf-bottle-cap"></div>
              <div className="amf-bottle-body">
                <span>FERT</span>
              </div>
            </div>

            <div className="amf-hero-badge">
              <strong>{stats.applications}</strong>
              <span>Applications</span>
            </div>

          </div>
        </section>

        {/* ALERTS */}
        {error && (
          <div className="amf-alert amf-alert-error">
            <span>⚠️</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {success && (
          <div className="amf-alert amf-alert-success">
            <span>✓</span>

            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>

            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {/* STATS */}
        <section className="amf-stats">

          <div className="amf-stat-card">
            <div className="amf-stat-icon amf-green">
              🧪
            </div>

            <div>
              <span>Total Applications</span>
              <strong>{stats.applications}</strong>
              <small>Recorded applications</small>
            </div>
          </div>

          <div className="amf-stat-card">
            <div className="amf-stat-icon amf-blue">
              ⚖️
            </div>

            <div>
              <span>Total Quantity</span>
              <strong>{formatNumber(stats.totalQuantity)}</strong>
              <small>Across all records</small>
            </div>
          </div>

          <div className="amf-stat-card">
            <div className="amf-stat-icon amf-gold">
              📅
            </div>

            <div>
              <span>This Month</span>
              <strong>{stats.thisMonth}</strong>
              <small>Applications this month</small>
            </div>
          </div>

          <div className="amf-stat-card">
            <div className="amf-stat-icon amf-purple">
              🌱
            </div>

            <div>
              <span>Fertilizer Types</span>
              <strong>{stats.fertilizerTypes}</strong>
              <small>Different products used</small>
            </div>
          </div>

        </section>

        {/* INFORMATION STRIP */}
        <section className="amf-info-card">

          <div className="amf-info-icon">
            💡
          </div>

          <div>
            <strong>Keep your application history organised</strong>

            <p>
              Recording every fertilizer application helps you maintain
              accurate farm records and understand how inputs are being
              used across your crops.
            </p>
          </div>

        </section>

        {/* RECORDS */}
        <section className="amf-record-card">

          <div className="amf-record-header">

            <div>
              <span className="amf-section-kicker">
                FARM RECORDS
              </span>

              <h2>Fertilizer Applications</h2>

              <p>
                Review and manage your fertilizer application history.
              </p>
            </div>

            <button
              className="amf-secondary-btn"
              onClick={openCreate}
            >
              ＋ New Application
            </button>

          </div>

          {/* FILTERS */}
          <div className="amf-filters">

            <div className="amf-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search fertilizer or remarks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            <select
              value={monthFilter}
              onChange={(event) =>
                setMonthFilter(event.target.value)
              }
            >
              <option value="All">All Months</option>

              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>

          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="amf-state">

              <div className="amf-spinner"></div>

              <h3>Loading fertilizer records...</h3>

              <p>
                Please wait while we fetch your farm data.
              </p>

            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="amf-empty">

              <div className="amf-empty-icon">
                🧪
              </div>

              <h3>
                {records.length
                  ? "No matching records"
                  : "No fertilizer records yet"}
              </h3>

              <p>
                {records.length
                  ? "Try changing your search or month filter."
                  : "Start recording fertilizer applications to build your farm history."}
              </p>

              {!records.length && (
                <button
                  className="amf-primary-btn"
                  onClick={openCreate}
                >
                  ＋ Add First Application
                </button>
              )}

            </div>
          ) : (
            <div className="amf-table-wrap">

              <table className="amf-table">

                <thead>
                  <tr>
                    <th>Fertilizer</th>
                    <th>Application Date</th>
                    <th>Quantity</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map((record) => {
                    const id = record._id || record.id;

                    return (
                      <tr key={id}>

                        <td>
                          <div className="amf-fertilizer-cell">

                            <div className="amf-fertilizer-icon">
                              🧪
                            </div>

                            <div>
                              <strong>
                                {record.fertilizerName}
                              </strong>

                              <span>
                                Fertilizer application
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="amf-date">
                            {formatDate(record.applicationDate)}
                          </span>
                        </td>

                        <td>
                          <strong className="amf-quantity">
                            {formatNumber(record.quantity)}
                          </strong>

                          <span className="amf-unit">
                            units
                          </span>
                        </td>

                        <td>
                          <span className="amf-muted">
                            {record.remarks || "No remarks"}
                          </span>
                        </td>

                        <td>
                          <div className="amf-actions">

                            <button
                              className="amf-edit-btn"
                              onClick={() => openEdit(record)}
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              className="amf-delete-btn"
                              onClick={() => handleDelete(id)}
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

            </div>
          )}

        </section>

      </div>

      {/* MODAL */}
      {showForm && (
        <div
          className="amf-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >

          <div className="amf-modal">

            <div className="amf-modal-header">

              <div>
                <span className="amf-section-kicker">
                  {editingId
                    ? "UPDATE RECORD"
                    : "NEW APPLICATION"}
                </span>

                <h2>
                  {editingId
                    ? "Edit Fertilizer"
                    : "Record Fertilizer"}
                </h2>

                <p>
                  Enter the details of the fertilizer application.
                </p>
              </div>

              <button
                className="amf-close-btn"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="amf-form-grid">

                <div className="amf-field amf-full">

                  <label>
                    Fertilizer Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="fertilizerName"
                    value={form.fertilizerName}
                    onChange={handleChange}
                    placeholder="e.g. Urea, DAP, NPK"
                    required
                  />

                </div>

                <div className="amf-field">

                  <label>
                    Quantity <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 50"
                    required
                  />

                </div>

                <div className="amf-field">

                  <label>
                    Application Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="applicationDate"
                    value={form.applicationDate}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="amf-field amf-full">

                  <label>
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Add information about the application..."
                  />

                </div>

              </div>

              <div className="amf-form-footer">

                <button
                  type="button"
                  className="amf-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="amf-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Record"
                    : "Save Application"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}