import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const emptyForm = (fields) => Object.fromEntries(fields.map((field) => [field.name, field.type === "select" ? (field.options?.[0] || "") : ""]));

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function CrudManager({ title, subtitle, icon = "🌱", endpoint, fields = [], columns = [] }) {
  const initialForm = useMemo(() => emptyForm(fields), [fields]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await get(endpoint);
      setItems(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (name, value, type) => {
    setForm((current) => ({
      ...current,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = { ...form };
      fields.forEach((field) => {
        if (field.type === "number" && payload[field.name] !== "") {
          payload[field.name] = Number(payload[field.name]);
        }
      });

      const result = editingId
        ? await put(`${endpoint}/${editingId}`, payload)
        : await post(endpoint, payload);

      setMessage(result.message || (editingId ? "Record updated successfully." : "Record created successfully."));
      resetForm();
      await load();
    } catch (err) {
      setError(err.message || "Unable to save record.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    const next = { ...initialForm };
    fields.forEach((field) => {
      next[field.name] = item[field.name] ?? (field.type === "select" ? (field.options?.[0] || "") : "");
    });
    setForm(next);
    setEditingId(item._id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const result = await del(`${endpoint}/${deleteId}`);
      setMessage(result.message || "Record deleted successfully.");
      setDeleteId(null);
      if (editingId === deleteId) resetForm();
      await load();
    } catch (err) {
      setError(err.message || "Unable to delete record.");
      setDeleteId(null);
    }
  };

  return (
    <div className="agri-page">
      <div className="agri-page-header">
        <div>
          <span className="agri-eyebrow">FARMER PORTAL</span>
          <h1>{icon} {title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="agri-stat-pill">
          <strong>{items.length}</strong>
          <span>Records</span>
        </div>
      </div>

      {message && <div className="save-message">✓ {message}</div>}
      {error && <div className="auth-error">{error}</div>}

      <section className="agri-card">
        <div className="agri-card-title">
          <h2>{editingId ? `Edit ${title}` : `Add ${title}`}</h2>
          {editingId && (
            <button type="button" className="agri-button secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        <form className="agri-form-grid" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name} className={field.full ? "full" : ""}>
              {field.label}
              {field.type === "select" ? (
                <select
                  value={form[field.name] ?? ""}
                  onChange={(event) => handleChange(field.name, event.target.value, field.type)}
                  required={field.required !== false}
                >
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  min={field.type === "number" ? 0 : undefined}
                  value={form[field.name] ?? ""}
                  onChange={(event) => handleChange(field.name, event.target.value, field.type)}
                  required={field.required !== false}
                />
              )}
            </label>
          ))}
          <div className="full">
            <button className="agri-button primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Record" : "Add Record"}
            </button>
          </div>
        </form>
      </section>

      <section className="agri-card">
        <div className="agri-card-title">
          <h2>Saved Records</h2>
          <button type="button" className="agri-button secondary" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="agri-empty"><div>⏳</div><h3>Loading records...</h3></div>
        ) : items.length === 0 ? (
          <div className="agri-empty">
            <div>{icon}</div>
            <h3>No records yet</h3>
            <p>Add your first record above. It will be stored in MongoDB.</p>
          </div>
        ) : (
          <div className="agri-table-wrap">
            <table className="agri-table">
              <thead>
                <tr>
                  {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {columns.map((column) => <td key={column.key}>{displayValue(item[column.key])}</td>)}
                    <td>
                      <button type="button" className="table-action" onClick={() => startEdit(item)}>Edit</button>
                      <button type="button" className="table-action danger" onClick={() => setDeleteId(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "min(420px, 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <h3 style={{ marginTop: 0 }}>Delete this record?</h3>
            <p style={{ color: "#68756d" }}>This record will be permanently removed from MongoDB.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="agri-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="agri-button" style={{ background: "#c33e3e", color: "#fff" }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
