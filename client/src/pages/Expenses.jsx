import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const categories = [
  "Seeds",
  "Fertilizer",
  "Labour",
  "Irrigation",
  "Equipment",
  "Transport",
  "Other",
];

const emptyForm = {
  title: "",
  category: "Seeds",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  crop: "",
  notes: "",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await get("/expenses");
      setExpenses(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
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
      setError("Please enter an expense title.");
      return;
    }

    if (!form.amount || Number(form.amount) < 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!form.date) {
      setError("Please select an expense date.");
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
        ? await put(`/expenses/${editingId}`, payload)
        : await post("/expenses", payload);

      setMessage(
        result.message ||
          (editingId
            ? "Expense updated successfully."
            : "Expense added successfully.")
      );

      resetForm();
      await loadExpenses();
    } catch (err) {
      setError(err.message || "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (expense) => {
    setForm({
      title: expense.title || "",
      category: expense.category || "Other",
      amount: expense.amount ?? "",
      date: expense.date || "",
      crop: expense.crop || "",
      notes: expense.notes || "",
    });

    setEditingId(expense._id);
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

      const result = await del(`/expenses/${deleteId}`);

      setMessage(result.message || "Expense deleted successfully.");
      setDeleteId(null);

      if (editingId === deleteId) {
        resetForm();
      }

      await loadExpenses();
    } catch (err) {
      setError(err.message || "Unable to delete expense.");
      setDeleteId(null);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const text = [
          expense.title,
          expense.category,
          expense.crop,
          expense.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = text.includes(
          search.toLowerCase()
        );

        const matchesCategory =
          categoryFilter === "All" ||
          expense.category === categoryFilter;

        const matchesMonth =
          monthFilter === "All" ||
          String(expense.date || "").startsWith(monthFilter);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesMonth
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );
  }, [
    expenses,
    search,
    categoryFilter,
    monthFilter,
  ]);

  const stats = useMemo(() => {
    const total = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    const thisMonthKey =
      new Date().toISOString().slice(0, 7);

    const thisMonth = expenses
      .filter((expense) =>
        String(expense.date || "").startsWith(
          thisMonthKey
        )
      )
      .reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      );

    const average =
      expenses.length > 0
        ? total / expenses.length
        : 0;

    const highest =
      expenses.length > 0
        ? Math.max(
            ...expenses.map((expense) =>
              Number(expense.amount || 0)
            )
          )
        : 0;

    return {
      total,
      thisMonth,
      average,
      highest,
    };
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals = {};

    categories.forEach((category) => {
      totals[category] = 0;
    });

    expenses.forEach((expense) => {
      const category =
        expense.category || "Other";

      totals[category] =
        (totals[category] || 0) +
        Number(expense.amount || 0);
    });

    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const months = useMemo(() => {
    const unique = [
      ...new Set(
        expenses
          .map((expense) =>
            String(expense.date || "").slice(0, 7)
          )
          .filter(Boolean)
      ),
    ];

    return unique.sort().reverse();
  }, [expenses]);

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

  const categoryIcon = (category) => {
    const icons = {
      Seeds: "🌱",
      Fertilizer: "🧪",
      Labour: "👨‍🌾",
      Irrigation: "💧",
      Equipment: "🚜",
      Transport: "🚚",
      Other: "📌",
    };

    return icons[category] || "📌";
  };

  if (loading) {
    return (
      <div className="afe-page">
        <div className="afe-loading">
          <div className="afe-loading-icon">💸</div>
          <h2>Loading your expenses...</h2>
          <p>
            Preparing your farm spending overview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="afe-page">
      {/* HERO */}
      <section className="afe-hero">
        <div>
          <span className="afe-eyebrow">
            FARM FINANCE
          </span>

          <h1>Track Every Farm Expense</h1>

          <p>
            Keep your farming costs organized, understand
            where your money goes, and make better financial
            decisions.
          </p>
        </div>

        <div className="afe-hero-summary">
          <span>₹</span>

          <div>
            <small>Total Spending</small>

            <strong>
              ₹{stats.total.toLocaleString("en-IN")}
            </strong>

            <em>
              {expenses.length} expense
              {expenses.length === 1 ? "" : "s"} recorded
            </em>
          </div>
        </div>
      </section>

      {/* MESSAGES */}
      {message && (
        <div className="afe-message afe-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="afe-message afe-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* STATS */}
      <section className="afe-stats">
        <div className="afe-stat-card">
          <div className="afe-stat-icon green">
            💰
          </div>

          <div>
            <span>Total Expenses</span>

            <strong>
              ₹{stats.total.toLocaleString("en-IN")}
            </strong>

            <small>All recorded spending</small>
          </div>
        </div>

        <div className="afe-stat-card">
          <div className="afe-stat-icon blue">
            📅
          </div>

          <div>
            <span>This Month</span>

            <strong>
              ₹
              {stats.thisMonth.toLocaleString("en-IN")}
            </strong>

            <small>Current month spending</small>
          </div>
        </div>

        <div className="afe-stat-card">
          <div className="afe-stat-icon orange">
            📊
          </div>

          <div>
            <span>Average Expense</span>

            <strong>
              ₹
              {Math.round(
                stats.average
              ).toLocaleString("en-IN")}
            </strong>

            <small>Per recorded expense</small>
          </div>
        </div>

        <div className="afe-stat-card">
          <div className="afe-stat-icon purple">
            🔝
          </div>

          <div>
            <span>Highest Expense</span>

            <strong>
              ₹
              {stats.highest.toLocaleString("en-IN")}
            </strong>

            <small>Largest single entry</small>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className="afe-main-grid">
        {/* ADD / EDIT */}
        <section className="afe-card afe-form-card">
          <div className="afe-card-header">
            <div>
              <span className="afe-section-label">
                {editingId
                  ? "UPDATE RECORD"
                  : "NEW RECORD"}
              </span>

              <h2>
                {editingId
                  ? "Edit Expense"
                  : "Add Expense"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="afe-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form
            className="afe-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>Expense Title</span>

              <input
                type="text"
                placeholder="e.g. Wheat seeds"
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
              <span>Category</span>

              <select
                value={form.category}
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value
                  )
                }
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Amount (₹)</span>

              <div className="afe-input-prefix">
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

            <label className="afe-full">
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

            <div className="afe-form-footer afe-full">
              <button
                className="afe-submit"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Expense"
                  : "Add Expense"}
              </button>

              {!editingId && (
                <button
                  type="button"
                  className="afe-reset"
                  onClick={resetForm}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        {/* CATEGORY BREAKDOWN */}
        <section className="afe-card afe-breakdown-card">
          <div className="afe-card-header">
            <div>
              <span className="afe-section-label">
                SPENDING ANALYSIS
              </span>

              <h2>Where Your Money Goes</h2>
            </div>
          </div>

          {categoryTotals.length === 0 ? (
            <div className="afe-small-empty">
              <span>📊</span>
              <p>
                Category spending will appear here after
                you add expenses.
              </p>
            </div>
          ) : (
            <div className="afe-category-list">
              {categoryTotals.map(
                ([category, amount]) => {
                  const percentage =
                    stats.total > 0
                      ? (amount / stats.total) * 100
                      : 0;

                  return (
                    <div
                      className="afe-category"
                      key={category}
                    >
                      <div className="afe-category-top">
                        <div>
                          <span className="afe-category-icon">
                            {categoryIcon(category)}
                          </span>

                          <strong>{category}</strong>
                        </div>

                        <span>
                          ₹
                          {amount.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="afe-progress">
                        <div
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <small>
                        {percentage.toFixed(1)}% of
                        total spending
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
      <section className="afe-card afe-records-card">
        <div className="afe-records-header">
          <div>
            <span className="afe-section-label">
              EXPENSE HISTORY
            </span>

            <h2>Saved Expenses</h2>
          </div>

          <button
            type="button"
            className="afe-refresh"
            onClick={loadExpenses}
          >
            ↻ Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="afe-filters">
          <div className="afe-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search expenses, crops or notes..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="All">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) =>
              setMonthFilter(e.target.value)
            }
          >
            <option value="All">All Months</option>

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

        {filteredExpenses.length === 0 ? (
          <div className="afe-empty">
            <div className="afe-empty-icon">
              💸
            </div>

            <h3>
              {expenses.length === 0
                ? "No expenses recorded yet"
                : "No matching expenses"}
            </h3>

            <p>
              {expenses.length === 0
                ? "Start recording your farm expenses to keep your finances organized."
                : "Try changing your search or filters."}
            </p>

            {expenses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All");
                  setMonthFilter("All");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="afe-table-wrap">
            <table className="afe-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Category</th>
                  <th>Crop</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map(
                  (expense) => (
                    <tr key={expense._id}>
                      <td>
                        <div className="afe-expense-name">
                          <div>
                            {categoryIcon(
                              expense.category
                            )}
                          </div>

                          <span>
                            <strong>
                              {expense.title}
                            </strong>

                            {expense.notes && (
                              <small>
                                {expense.notes}
                              </small>
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="afe-category-pill">
                          {expense.category ||
                            "Other"}
                        </span>
                      </td>

                      <td>
                        <span className="afe-crop">
                          {expense.crop || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="afe-date">
                          {formatDate(
                            expense.date
                          )}
                        </span>
                      </td>

                      <td>
                        <strong className="afe-amount">
                          ₹
                          {Number(
                            expense.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="afe-actions">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(expense)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              setDeleteId(
                                expense._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DELETE MODAL */}
      {deleteId && (
        <div
          className="afe-modal-overlay"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="afe-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="afe-modal-icon">
              🗑️
            </div>

            <h3>Delete this expense?</h3>

            <p>
              This expense will be permanently removed
              from your farm records.
            </p>

            <div className="afe-modal-actions">
              <button
                type="button"
                className="afe-modal-cancel"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="afe-modal-delete"
                onClick={confirmDelete}
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}