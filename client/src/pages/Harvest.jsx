import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const EMPTY_FORM = {
  crop: "",
  harvestDate: "",
  quantity: "",
  unit: "kg",
  quality: "Grade A",
  storageInformation: "",
  remarks: "",
};

const UNIT_OPTIONS = ["kg", "quintal", "ton"];
const QUALITY_OPTIONS = ["Grade A", "Grade B", "Grade C"];

export default function Harvest() {
  const [harvests, setHarvests] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [qualityFilter, setQualityFilter] = useState("All");
  const [unitFilter, setUnitFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadHarvests();
  }, []);

  const loadHarvests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await get("/harvests");

      const data = Array.isArray(response)
        ? response
        : response?.harvests ||
          response?.data ||
          response?.items ||
          [];

      setHarvests(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load harvest records.");
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
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (harvest) => {
    setForm({
      crop: harvest.crop || "",
      harvestDate: harvest.harvestDate || "",
      quantity: harvest.quantity ?? "",
      unit: harvest.unit || "kg",
      quality: harvest.quality || "Grade A",
      storageInformation: harvest.storageInformation || "",
      remarks: harvest.remarks || "",
    });

    setEditingId(harvest._id || harvest.id);
    setSuccess("");
    setError("");
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

    if (!form.crop.trim()) {
      setError("Please enter the crop name.");
      return;
    }

    if (!form.harvestDate) {
      setError("Please select the harvest date.");
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

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        crop: form.crop.trim(),
        harvestDate: form.harvestDate,
        quantity: Number(form.quantity),
        unit: form.unit,
        quality: form.quality,
        storageInformation: form.storageInformation.trim(),
        remarks: form.remarks.trim(),
      };

      if (editingId) {
        await put(`/harvests/${editingId}`, payload);
        setSuccess("Harvest record updated successfully.");
      } else {
        await post("/harvests", payload);
        setSuccess("Harvest record added successfully.");
      }

      closeForm();
      await loadHarvests();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save harvest record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this harvest record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await del(`/harvests/${id}`);

      setHarvests((previous) =>
        previous.filter((item) => (item._id || item.id) !== id)
      );

      setSuccess("Harvest record deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete harvest record."
      );
    }
  };

  const filteredHarvests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return harvests
      .filter((item) => {
        const matchesSearch =
          !query ||
          String(item.crop || "")
            .toLowerCase()
            .includes(query) ||
          String(item.storageInformation || "")
            .toLowerCase()
            .includes(query) ||
          String(item.remarks || "")
            .toLowerCase()
            .includes(query);

        const matchesQuality =
          qualityFilter === "All" ||
          String(item.quality || "") === qualityFilter;

        const matchesUnit =
          unitFilter === "All" ||
          String(item.unit || "") === unitFilter;

        return matchesSearch && matchesQuality && matchesUnit;
      })
      .sort((a, b) => {
        const first = new Date(a.harvestDate || 0).getTime();
        const second = new Date(b.harvestDate || 0).getTime();

        return second - first;
      });
  }, [harvests, search, qualityFilter, unitFilter]);

  const stats = useMemo(() => {
    const totalRecords = harvests.length;

    const totalKg = harvests.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unit = String(item.unit || "kg").toLowerCase();

      if (unit === "ton") return sum + quantity * 1000;
      if (unit === "quintal") return sum + quantity * 100;

      return sum + quantity;
    }, 0);

    const gradeA = harvests.filter(
      (item) => item.quality === "Grade A"
    ).length;

    const gradeB = harvests.filter(
      (item) => item.quality === "Grade B"
    ).length;

    const gradeC = harvests.filter(
      (item) => item.quality === "Grade C"
    ).length;

    return {
      totalRecords,
      totalKg,
      gradeA,
      gradeB,
      gradeC,
    };
  }, [harvests]);

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value || 0);
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

  const getQualityClass = (quality) => {
    if (quality === "Grade A") return "amh-quality-a";
    if (quality === "Grade B") return "amh-quality-b";
    return "amh-quality-c";
  };

  return (
    <div className="amh-page">
      <div className="amh-shell">

        {/* HERO */}
        <section className="amh-hero">
          <div className="amh-hero-content">
            <div className="amh-eyebrow">
              <span>🌾</span>
              HARVEST MANAGEMENT
            </div>

            <h1>Track every harvest.</h1>

            <p>
              Record your harvested crops, monitor quantities and keep
              important quality and storage information in one place.
            </p>

            <button className="amh-primary-btn" onClick={openCreate}>
              <span>＋</span>
              Add Harvest
            </button>
          </div>

          <div className="amh-hero-art">
            <div className="amh-sun">☀️</div>
            <div className="amh-field">
              <span>🌾</span>
              <span>🌾</span>
              <span>🌾</span>
              <span>🌾</span>
              <span>🌾</span>
            </div>

            <div className="amh-hero-badge">
              <strong>{stats.totalRecords}</strong>
              <span>Harvest Records</span>
            </div>
          </div>
        </section>

        {/* ALERTS */}
        {error && (
          <div className="amh-alert amh-alert-error">
            <span>⚠️</span>
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {success && (
          <div className="amh-alert amh-alert-success">
            <span>✓</span>
            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>

            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {/* STATS */}
        <section className="amh-stats-grid">

          <div className="amh-stat-card">
            <div className="amh-stat-icon amh-icon-green">🌾</div>

            <div>
              <span>Total Harvests</span>
              <strong>{stats.totalRecords}</strong>
              <small>Recorded batches</small>
            </div>
          </div>

          <div className="amh-stat-card">
            <div className="amh-stat-icon amh-icon-blue">⚖️</div>

            <div>
              <span>Total Quantity</span>
              <strong>{formatNumber(stats.totalKg)}</strong>
              <small>Approx. kg equivalent</small>
            </div>
          </div>

          <div className="amh-stat-card">
            <div className="amh-stat-icon amh-icon-gold">⭐</div>

            <div>
              <span>Grade A</span>
              <strong>{stats.gradeA}</strong>
              <small>Premium harvests</small>
            </div>
          </div>

          <div className="amh-stat-card">
            <div className="amh-stat-icon amh-icon-purple">📦</div>

            <div>
              <span>Grade B / C</span>
              <strong>{stats.gradeB + stats.gradeC}</strong>
              <small>Other quality grades</small>
            </div>
          </div>

        </section>

        {/* QUALITY OVERVIEW */}
        <section className="amh-overview-card">

          <div className="amh-section-heading">
            <div>
              <span className="amh-section-kicker">QUALITY OVERVIEW</span>
              <h2>Harvest quality breakdown</h2>
            </div>

            <span className="amh-record-count">
              {harvests.length} records
            </span>
          </div>

          <div className="amh-quality-grid">

            <div className="amh-quality-box">
              <div className="amh-quality-top">
                <span className="amh-quality-dot amh-dot-a"></span>
                <span>Grade A</span>
                <strong>{stats.gradeA}</strong>
              </div>

              <div className="amh-progress">
                <div
                  style={{
                    width: `${
                      harvests.length
                        ? (stats.gradeA / harvests.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="amh-quality-box">
              <div className="amh-quality-top">
                <span className="amh-quality-dot amh-dot-b"></span>
                <span>Grade B</span>
                <strong>{stats.gradeB}</strong>
              </div>

              <div className="amh-progress">
                <div
                  style={{
                    width: `${
                      harvests.length
                        ? (stats.gradeB / harvests.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="amh-quality-box">
              <div className="amh-quality-top">
                <span className="amh-quality-dot amh-dot-c"></span>
                <span>Grade C</span>
                <strong>{stats.gradeC}</strong>
              </div>

              <div className="amh-progress">
                <div
                  style={{
                    width: `${
                      harvests.length
                        ? (stats.gradeC / harvests.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* RECORDS */}
        <section className="amh-record-card">

          <div className="amh-record-header">

            <div>
              <span className="amh-section-kicker">YOUR FARM</span>
              <h2>Harvest Records</h2>
              <p>
                Review, edit and manage all your harvest entries.
              </p>
            </div>

            <button
              className="amh-secondary-btn"
              onClick={openCreate}
            >
              ＋ New Record
            </button>

          </div>

          {/* FILTERS */}
          <div className="amh-filters">

            <div className="amh-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search crop, storage or remarks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")}>×</button>
              )}
            </div>

            <select
              value={qualityFilter}
              onChange={(event) => setQualityFilter(event.target.value)}
            >
              <option value="All">All Quality</option>
              {QUALITY_OPTIONS.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>

            <select
              value={unitFilter}
              onChange={(event) => setUnitFilter(event.target.value)}
            >
              <option value="All">All Units</option>
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

          </div>

          {/* TABLE */}
          {loading ? (
            <div className="amh-state">
              <div className="amh-spinner"></div>
              <h3>Loading harvest records...</h3>
              <p>Please wait while we fetch your farm data.</p>
            </div>
          ) : filteredHarvests.length === 0 ? (
            <div className="amh-empty">

              <div className="amh-empty-icon">🌾</div>

              <h3>
                {harvests.length
                  ? "No matching harvests"
                  : "No harvest records yet"}
              </h3>

              <p>
                {harvests.length
                  ? "Try changing your search or filters."
                  : "Start recording your harvest to keep your farm data organised."}
              </p>

              {!harvests.length && (
                <button
                  className="amh-primary-btn"
                  onClick={openCreate}
                >
                  ＋ Add First Harvest
                </button>
              )}

            </div>
          ) : (
            <div className="amh-table-wrap">
              <table className="amh-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Harvest Date</th>
                    <th>Quantity</th>
                    <th>Quality</th>
                    <th>Storage</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHarvests.map((harvest) => {
                    const id = harvest._id || harvest.id;

                    return (
                      <tr key={id}>

                        <td>
                          <div className="amh-crop-cell">
                            <div className="amh-crop-icon">
                              🌱
                            </div>

                            <div>
                              <strong>{harvest.crop}</strong>
                              <span>Harvest batch</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="amh-date">
                            {formatDate(harvest.harvestDate)}
                          </span>
                        </td>

                        <td>
                          <strong className="amh-quantity">
                            {formatNumber(harvest.quantity)}
                          </strong>

                          <span className="amh-unit">
                            {harvest.unit || "kg"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`amh-quality ${getQualityClass(
                              harvest.quality
                            )}`}
                          >
                            {harvest.quality || "Grade A"}
                          </span>
                        </td>

                        <td>
                          <span className="amh-muted">
                            {harvest.storageInformation || "Not specified"}
                          </span>
                        </td>

                        <td>
                          <span className="amh-muted">
                            {harvest.remarks || "—"}
                          </span>
                        </td>

                        <td>
                          <div className="amh-actions">

                            <button
                              className="amh-edit-btn"
                              onClick={() => openEdit(harvest)}
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              className="amh-delete-btn"
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

      {/* FORM MODAL */}
      {showForm && (
        <div
          className="amh-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="amh-modal">

            <div className="amh-modal-header">
              <div>
                <span className="amh-section-kicker">
                  {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                </span>

                <h2>
                  {editingId
                    ? "Edit Harvest"
                    : "Record New Harvest"}
                </h2>

                <p>
                  Add the details of your harvested crop.
                </p>
              </div>

              <button
                className="amh-close-btn"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="amh-form-grid">

                <div className="amh-field amh-field-full">
                  <label>
                    Crop Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="crop"
                    value={form.crop}
                    onChange={handleChange}
                    placeholder="e.g. Wheat, Rice, Tomato"
                    required
                  />
                </div>

                <div className="amh-field">
                  <label>
                    Harvest Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="harvestDate"
                    value={form.harvestDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="amh-field">
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
                    placeholder="e.g. 500"
                    required
                  />
                </div>

                <div className="amh-field">
                  <label>Unit</label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="amh-field">
                  <label>Quality Grade</label>

                  <select
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                  >
                    {QUALITY_OPTIONS.map((quality) => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="amh-field amh-field-full">
                  <label>Storage Information</label>

                  <input
                    type="text"
                    name="storageInformation"
                    value={form.storageInformation}
                    onChange={handleChange}
                    placeholder="e.g. Warehouse A, Cold Storage, Shed 2"
                  />
                </div>

                <div className="amh-field amh-field-full">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Add any additional notes about this harvest..."
                  />
                </div>

              </div>

              <div className="amh-form-footer">

                <button
                  type="button"
                  className="amh-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="amh-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Harvest"
                    : "Save Harvest"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}