import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const sources = [
  "Crop Sale",
  "Government Scheme",
  "Other",
];

const emptyForm = {
  title: "",
  source: "Crop Sale",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  crop: "",
  notes: "",
};

export default function Income() {
  const [income, setIncome] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadIncome = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await get("/income");
      setIncome(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to load income records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncome();
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().split("T")[0],
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter an income title.");
      return;
    }

    if (!form.amount || Number(form.amount) < 0) {
      setError("Please enter a valid income amount.");
      return;
    }

    if (!form.date) {
      setError("Please select an income date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      const result = editingId
        ? await put(`/income/${editingId}`, payload)
        : await post("/income", payload);

      setMessage(
        result.message ||
          (editingId
            ? "Income record updated successfully."
            : "Income record added successfully.")
      );

      resetForm();
      await loadIncome();
    } catch (err) {
      setError(err.message || "Unable to save income record.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (record) => {
    setForm({
      title: record.title || "",
      source: record.source || "Crop Sale",
      amount: record.amount ?? "",
      date: record.date || "",
      crop: record.crop || "",
      notes: record.notes || "",
    });

    setEditingId(record._id);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setError("");
      setMessage("");

      const result = await del(`/income/${deleteId}`);

      setMessage(result.message || "Income record deleted successfully.");
      setDeleteId(null);

      if (editingId === deleteId) {
        resetForm();
      }

      await loadIncome();
    } catch (err) {
      setError(err.message || "Unable to delete income record.");
      setDeleteId(null);
    }
  };

  const filteredIncome = useMemo(() => {
    return income
      .filter((record) => {
        const searchable = [
          record.title,
          record.source,
          record.crop,
          record.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchable.includes(
          search.toLowerCase()
        );

        const matchesSource =
          sourceFilter === "All" ||
          record.source === sourceFilter;

        const matchesMonth =
          monthFilter === "All" ||
          String(record.date || "").startsWith(monthFilter);

        return (
          matchesSearch &&
          matchesSource &&
          matchesMonth
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );
  }, [income, search, sourceFilter, monthFilter]);

  const stats = useMemo(() => {
    const total = income.reduce(
      (sum, record) =>
        sum + Number(record.amount || 0),
      0
    );

    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7);

    const thisMonth = income
      .filter((record) =>
        String(record.date || "").startsWith(currentMonth)
      )
      .reduce(
        (sum, record) =>
          sum + Number(record.amount || 0),
        0
      );

    const average =
      income.length > 0
        ? total / income.length
        : 0;

    const highest =
      income.length > 0
        ? Math.max(
            ...income.map((record) =>
              Number(record.amount || 0)
            )
          )
        : 0;

    return {
      total,
      thisMonth,
      average,
      highest,
    };
  }, [income]);

  const sourceTotals = useMemo(() => {
    const totals = {};

    sources.forEach((source) => {
      totals[source] = 0;
    });

    income.forEach((record) => {
      const source = record.source || "Other";

      totals[source] =
        (totals[source] || 0) +
        Number(record.amount || 0);
    });

    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [income]);

  const months = useMemo(() => {
    return [
      ...new Set(
        income
          .map((record) =>
            String(record.date || "").slice(0, 7)
          )
          .filter(Boolean)
      ),
    ].sort().reverse();
  }, [income]);

  const formatMonth = (month) => {
    if (!month) return "";

    const date = new Date(`${month}-01`);

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const sourceIcon = (source) => {
    const icons = {
      "Crop Sale": "🌾",
      "Government Scheme": "🏛️",
      Other: "💰",
    };

    return icons[source] || "💰";
  };

  if (loading) {
    return (
      <div className="ain-page">
        <div className="ain-loading">
          <div className="ain-loading-icon">📈</div>

          <h2>Loading your income...</h2>

          <p>
            Preparing your farm earnings overview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ain-page">

      {/* HERO */}
      <section className="ain-hero">
        <div>
          <span className="ain-eyebrow">
            FARM FINANCE
          </span>

          <h1>Track Your Farm Income</h1>

          <p>
            Keep your earnings organized, monitor crop
            sales and understand how your farm generates
            income.
          </p>
        </div>

        <div className="ain-hero-summary">
          <span>₹</span>

          <div>
            <small>Total Income</small>

            <strong>
              ₹{stats.total.toLocaleString("en-IN")}
            </strong>

            <em>
              {income.length} income record
              {income.length === 1 ? "" : "s"}
            </em>
          </div>
        </div>
      </section>

      {/* MESSAGES */}
      {message && (
        <div className="ain-message ain-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="ain-message ain-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* STATS */}
      <section className="ain-stats">

        <div className="ain-stat-card">
          <div className="ain-stat-icon green">
            💰
          </div>

          <div>
            <span>Total Income</span>

            <strong>
              ₹{stats.total.toLocaleString("en-IN")}
            </strong>

            <small>All recorded earnings</small>
          </div>
        </div>

        <div className="ain-stat-card">
          <div className="ain-stat-icon blue">
            📅
          </div>

          <div>
            <span>This Month</span>

            <strong>
              ₹{stats.thisMonth.toLocaleString("en-IN")}
            </strong>

            <small>Current month earnings</small>
          </div>
        </div>

        <div className="ain-stat-card">
          <div className="ain-stat-icon orange">
            📊
          </div>

          <div>
            <span>Average Income</span>

            <strong>
              ₹{Math.round(stats.average).toLocaleString("en-IN")}
            </strong>

            <small>Per income record</small>
          </div>
        </div>

        <div className="ain-stat-card">
          <div className="ain-stat-icon purple">
            🔝
          </div>

          <div>
            <span>Highest Income</span>

            <strong>
              ₹{stats.highest.toLocaleString("en-IN")}
            </strong>

            <small>Largest single earning</small>
          </div>
        </div>

      </section>

      {/* FORM + BREAKDOWN */}
      <div className="ain-main-grid">

        {/* FORM */}
        <section className="ain-card ain-form-card">

          <div className="ain-card-header">
            <div>
              <span className="ain-section-label">
                {editingId ? "UPDATE RECORD" : "NEW RECORD"}
              </span>

              <h2>
                {editingId
                  ? "Edit Income"
                  : "Add Income"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="ain-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form
            className="ain-form"
            onSubmit={handleSubmit}
          >

            <label>
              <span>Income Title</span>

              <input
                type="text"
                placeholder="e.g. Wheat sale"
                value={form.title}
                onChange={(e) =>
                  handleChange(
                    "title",
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>Income Source</span>

              <select
                value={form.source}
                onChange={(e) =>
                  handleChange(
                    "source",
                    e.target.value
                  )
                }
              >
                {sources.map((source) => (
                  <option
                    key={source}
                    value={source}
                  >
                    {source}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Amount (₹)</span>

              <div className="ain-input-prefix">
                <b>₹</b>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) =>
                    handleChange(
                      "amount",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </label>

            <label>
              <span>Date</span>

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  handleChange(
                    "date",
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>Crop</span>

              <input
                type="text"
                placeholder="e.g. Wheat"
                value={form.crop}
                onChange={(e) =>
                  handleChange(
                    "crop",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="ain-full">
              <span>Notes</span>

              <textarea
                rows="4"
                placeholder="Add any useful details..."
                value={form.notes}
                onChange={(e) =>
                  handleChange(
                    "notes",
                    e.target.value
                  )
                }
              />
            </label>

            <div className="ain-form-footer ain-full">

              <button
                className="ain-submit"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Income"
                  : "Add Income"}
              </button>

              {!editingId && (
                <button
                  type="button"
                  className="ain-reset"
                  onClick={resetForm}
                >
                  Clear
                </button>
              )}

            </div>

          </form>
        </section>

        {/* SOURCE BREAKDOWN */}
        <section className="ain-card ain-breakdown-card">

          <div className="ain-card-header">
            <div>
              <span className="ain-section-label">
                EARNINGS ANALYSIS
              </span>

              <h2>Income Sources</h2>
            </div>
          </div>

          {sourceTotals.length === 0 ? (
            <div className="ain-small-empty">
              <span>📊</span>

              <p>
                Income source breakdown will appear here
                after you add earnings.
              </p>
            </div>
          ) : (
            <div className="ain-source-list">

              {sourceTotals.map(
                ([source, amount]) => {
                  const percentage =
                    stats.total > 0
                      ? (amount / stats.total) * 100
                      : 0;

                  return (
                    <div
                      className="ain-source"
                      key={source}
                    >

                      <div className="ain-source-top">

                        <div>
                          <span className="ain-source-icon">
                            {sourceIcon(source)}
                          </span>

                          <strong>{source}</strong>
                        </div>

                        <span>
                          ₹{amount.toLocaleString("en-IN")}
                        </span>

                      </div>

                      <div className="ain-progress">
                        <div
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <small>
                        {percentage.toFixed(1)}% of total income
                      </small>

                    </div>
                  );
                }
              )}

            </div>
          )}
        </section>

      </div>

      {/* RECORDS */}
      <section className="ain-card ain-records-card">

        <div className="ain-records-header">
          <div>
            <span className="ain-section-label">
              INCOME HISTORY
            </span>

            <h2>Saved Income Records</h2>
          </div>

          <button
            type="button"
            className="ain-refresh"
            onClick={loadIncome}
          >
            ↻ Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="ain-filters">

          <div className="ain-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search income, crops or notes..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter(e.target.value)
            }
          >
            <option value="All">
              All Sources
            </option>

            {sources.map((source) => (
              <option
                key={source}
                value={source}
              >
                {source}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) =>
              setMonthFilter(e.target.value)
            }
          >
            <option value="All">
              All Months
            </option>

            {months.map((month) => (
              <option
                key={month}
                value={month}
              >
                {formatMonth(month)}
              </option>
            ))}
          </select>

        </div>

        {filteredIncome.length === 0 ? (
          <div className="ain-empty">

            <div className="ain-empty-icon">
              📈
            </div>

            <h3>
              {income.length === 0
                ? "No income recorded yet"
                : "No matching income records"}
            </h3>

            <p>
              {income.length === 0
                ? "Start recording your farm earnings to keep your financial records organized."
                : "Try changing your search or filters."}
            </p>

            {income.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSourceFilter("All");
                  setMonthFilter("All");
                }}
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (

          <div className="ain-table-wrap">

            <table className="ain-table">

              <thead>
                <tr>
                  <th>Income</th>
                  <th>Source</th>
                  <th>Crop</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredIncome.map((record) => (
                  <tr key={record._id}>

                    <td>
                      <div className="ain-income-name">

                        <div>
                          {sourceIcon(record.source)}
                        </div>

                        <span>
                          <strong>
                            {record.title}
                          </strong>

                          {record.notes && (
                            <small>
                              {record.notes}
                            </small>
                          )}
                        </span>

                      </div>
                    </td>

                    <td>
                      <span className="ain-source-pill">
                        {record.source || "Other"}
                      </span>
                    </td>

                    <td>
                      <span className="ain-crop">
                        {record.crop || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="ain-date">
                        {formatDate(record.date)}
                      </span>
                    </td>

                    <td>
                      <strong className="ain-amount">
                        +₹
                        {Number(
                          record.amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <div className="ain-actions">

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(record)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            setDeleteId(record._id)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* DELETE MODAL */}
      {deleteId && (
        <div
          className="ain-modal-overlay"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="ain-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="ain-modal-icon">
              🗑️
            </div>

            <h3>Delete this income record?</h3>

            <p>
              This earning record will be permanently
              removed from your farm finances.
            </p>

            <div className="ain-modal-actions">

              <button
                type="button"
                className="ain-modal-cancel"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="ain-modal-delete"
                onClick={confirmDelete}
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