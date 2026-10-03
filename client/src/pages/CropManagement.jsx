import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const EMPTY_FORM = {
  name: "",
  category: "Vegetable",
  production: "",
  stored: "",
  sold: "",
  unit: "kg",
  plantingDate: "",
  harvestDate: "",
};

const CATEGORIES = [
  "Vegetable",
  "Fruit",
  "Grain",
  "Pulse",
  "Oilseed",
];

const UNITS = ["kg", "quintal", "ton"];

export default function CropManagement() {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD CROPS
  // =========================================================

  const loadCrops = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await get("/crops");

      setCrops(
        Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your crops."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditForm = (crop) => {
    setEditingId(crop._id);

    setForm({
      name: crop.name || "",
      category: crop.category || "Vegetable",
      production: crop.production ?? "",
      stored: crop.stored ?? "",
      sold: crop.sold ?? "",
      unit: crop.unit || "kg",
      plantingDate: crop.plantingDate || "",
      harvestDate: crop.harvestDate || "",
    });

    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const production = Number(
        form.production || 0
      );

      const stored = Number(
        form.stored || 0
      );

      const sold = Number(
        form.sold || 0
      );

      if (!form.name.trim()) {
        throw new Error(
          "Please enter the crop name."
        );
      }

      if (!form.production) {
        throw new Error(
          "Please enter total production."
        );
      }

      if (production <= 0) {
        throw new Error(
          "Production must be greater than zero."
        );
      }

      if (stored < 0 || sold < 0) {
        throw new Error(
          "Stored and sold quantities cannot be negative."
        );
      }

      if (stored + sold > production) {
        throw new Error(
          "Stored quantity and sold quantity together cannot be greater than total production."
        );
      }

      if (
        form.plantingDate &&
        form.harvestDate &&
        form.harvestDate < form.plantingDate
      ) {
        throw new Error(
          "Harvest date cannot be earlier than planting date."
        );
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        production,
        stored,
        sold,
        unit: form.unit,
        plantingDate: form.plantingDate,
        harvestDate: form.harvestDate,
      };

      let result;

      if (editingId) {
        result = await put(
          `/crops/${editingId}`,
          payload
        );
      } else {
        result = await post(
          "/crops",
          payload
        );
      }

      setMessage(
        result?.message ||
          (editingId
            ? "Crop updated successfully."
            : "Crop added successfully.")
      );

      setShowForm(false);
      resetForm();

      await loadCrops();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save crop."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const result = await del(
        `/crops/${deleteId}`
      );

      setMessage(
        result?.message ||
          "Crop deleted successfully."
      );

      setDeleteId(null);

      if (editingId === deleteId) {
        resetForm();
        setShowForm(false);
      }

      await loadCrops();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete crop."
      );

      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const getAvailable = (crop) => {
    return Math.max(
      0,
      Number(crop.production || 0) -
        Number(crop.stored || 0) -
        Number(crop.sold || 0)
    );
  };

  const totals = useMemo(() => {
    return crops.reduce(
      (acc, crop) => {
        acc.production += Number(
          crop.production || 0
        );

        acc.stored += Number(
          crop.stored || 0
        );

        acc.sold += Number(
          crop.sold || 0
        );

        acc.available += getAvailable(crop);

        return acc;
      },
      {
        production: 0,
        stored: 0,
        sold: 0,
        available: 0,
      }
    );
  }, [crops]);

  const categories = useMemo(() => {
    return [
      "All",
      ...CATEGORIES.filter((category) =>
        crops.some(
          (crop) =>
            crop.category === category
        )
      ),
    ];
  }, [crops]);

  const filteredCrops = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return crops.filter((crop) => {
      const matchesSearch =
        !query ||
        String(crop.name || "")
          .toLowerCase()
          .includes(query) ||
        String(crop.category || "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        crop.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    crops,
    search,
    categoryFilter,
  ]);

  const formAvailable =
    Number(form.production || 0) -
    Number(form.stored || 0) -
    Number(form.sold || 0);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="acm-page">
        <div className="acm-loading">
          <div className="acm-loading-icon">
            🌱
          </div>

          <h2>
            Loading your crops...
          </h2>

          <p>
            Fetching your latest crop records.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="acm-page">

      {/* HEADER */}

      <header className="acm-header">

        <div>
          <span className="acm-eyebrow">
            FARMER PORTAL
          </span>

          <h1>
            Crop Management
          </h1>

          <p>
            Track crop production, storage,
            sales and harvest information.
          </p>
        </div>

        <button
          type="button"
          className="acm-add-btn"
          onClick={openAddForm}
        >
          <span>＋</span>
          Add Crop
        </button>

      </header>


      {/* ALERTS */}

      {message && (
        <div className="acm-alert acm-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="acm-alert acm-error">
          <span>⚠</span>
          {error}
        </div>
      )}


      {/* STATISTICS */}

      <section className="acm-stats">

        <div className="acm-stat-card">

          <div className="acm-stat-icon green">
            🌱
          </div>

          <div>
            <span>
              TOTAL CROPS
            </span>

            <strong>
              {crops.length}
            </strong>

            <small>
              Registered crops
            </small>
          </div>

        </div>


        <div className="acm-stat-card">

          <div className="acm-stat-icon yellow">
            🌾
          </div>

          <div>
            <span>
              PRODUCTION
            </span>

            <strong>
              {totals.production.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Total quantity
            </small>
          </div>

        </div>


        <div className="acm-stat-card">

          <div className="acm-stat-icon blue">
            📦
          </div>

          <div>
            <span>
              STORED
            </span>

            <strong>
              {totals.stored.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Current storage
            </small>
          </div>

        </div>


        <div className="acm-stat-card">

          <div className="acm-stat-icon orange">
            🛒
          </div>

          <div>
            <span>
              AVAILABLE
            </span>

            <strong>
              {totals.available.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Ready for sale
            </small>
          </div>

        </div>

      </section>


      {/* ADD / EDIT FORM */}

      {showForm && (

        <section className="acm-form-card">

          <div className="acm-form-header">

            <div>

              <span>
                {editingId
                  ? "UPDATE CROP"
                  : "NEW CROP"}
              </span>

              <h2>
                {editingId
                  ? "Edit Crop Details"
                  : "Add a New Crop"}
              </h2>

              <p>
                Keep your production and
                harvest records up to date.
              </p>

            </div>

            <button
              type="button"
              className="acm-close"
              onClick={closeForm}
              disabled={saving}
            >
              ×
            </button>

          </div>


          <form
            className="acm-form"
            onSubmit={handleSubmit}
          >

            <div className="acm-field">

              <label>
                Crop Name
              </label>

              <input
                name="name"
                type="text"
                placeholder="e.g. Tomatoes"
                value={form.name}
                onChange={handleChange}
                required
              />

            </div>


            <div className="acm-field">

              <label>
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(
                  (category) => (
                    <option
                      value={category}
                      key={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>

            </div>


            <div className="acm-field">

              <label>
                Total Production
              </label>

              <input
                name="production"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                value={form.production}
                onChange={handleChange}
                required
              />

            </div>


            <div className="acm-field">

              <label>
                Unit
              </label>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
              >
                {UNITS.map((unit) => (
                  <option
                    value={unit}
                    key={unit}
                  >
                    {unit}
                  </option>
                ))}
              </select>

            </div>


            <div className="acm-field">

              <label>
                Stored Quantity
              </label>

              <input
                name="stored"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 120"
                value={form.stored}
                onChange={handleChange}
              />

            </div>


            <div className="acm-field">

              <label>
                Sold Quantity
              </label>

              <input
                name="sold"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 60"
                value={form.sold}
                onChange={handleChange}
              />

            </div>


            <div className="acm-field">

              <label>
                Planting Date
              </label>

              <input
                name="plantingDate"
                type="date"
                value={form.plantingDate}
                onChange={handleChange}
              />

            </div>


            <div className="acm-field">

              <label>
                Harvest Date
              </label>

              <input
                name="harvestDate"
                type="date"
                value={form.harvestDate}
                onChange={handleChange}
              />

            </div>


            {/* PREVIEW */}

            <div className="acm-preview">

              <div>
                <span>
                  TOTAL PRODUCTION
                </span>

                <strong>
                  {Number(
                    form.production || 0
                  ).toLocaleString("en-IN")}{" "}
                  {form.unit}
                </strong>
              </div>

              <div>
                <span>
                  STORED
                </span>

                <strong>
                  {Number(
                    form.stored || 0
                  ).toLocaleString("en-IN")}{" "}
                  {form.unit}
                </strong>
              </div>

              <div>
                <span>
                  SOLD
                </span>

                <strong>
                  {Number(
                    form.sold || 0
                  ).toLocaleString("en-IN")}{" "}
                  {form.unit}
                </strong>
              </div>

              <div
                className={
                  formAvailable < 0
                    ? "danger"
                    : "available"
                }
              >
                <span>
                  AVAILABLE
                </span>

                <strong>
                  {formAvailable.toLocaleString(
                    "en-IN"
                  )}{" "}
                  {form.unit}
                </strong>
              </div>

            </div>


            {/* ACTIONS */}

            <div className="acm-form-actions">

              <button
                type="button"
                className="acm-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="acm-save"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Crop"
                  : "Save Crop"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* CROP LIST */}

      <section className="acm-list-section">

        <div className="acm-list-header">

          <div>

            <span>
              YOUR CROPS
            </span>

            <h2>
              Crop Records
            </h2>

            <p>
              Monitor production, storage and
              sales for every crop.
            </p>

          </div>

          <button
            type="button"
            className="acm-refresh"
            onClick={loadCrops}
          >
            ↻ Refresh
          </button>

        </div>


        {/* SEARCH */}

        <div className="acm-toolbar">

          <div className="acm-search">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search crops..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="acm-filters">

            {categories.map(
              (category) => (

                <button
                  type="button"
                  key={category}
                  className={
                    categoryFilter ===
                    category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCategoryFilter(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>

        </div>


        {/* EMPTY */}

        {filteredCrops.length === 0 ? (

          <div className="acm-empty">

            <div className="acm-empty-icon">
              🌱
            </div>

            <h3>
              {crops.length === 0
                ? "No crops added yet"
                : "No matching crops"}
            </h3>

            <p>
              {crops.length === 0
                ? "Start tracking your crops by adding your first crop record."
                : "Try changing your search or category filter."}
            </p>

            {crops.length === 0 && (
              <button
                type="button"
                className="acm-add-btn"
                onClick={openAddForm}
              >
                ＋ Add Your First Crop
              </button>
            )}

          </div>

        ) : (

          <div className="acm-grid">

            {filteredCrops.map((crop) => {

              const available =
                getAvailable(crop);

              return (

                <article
                  className="acm-card"
                  key={crop._id}
                >

                  {/* CARD TOP */}

                  <div className="acm-card-top">

                    <div className="acm-crop-title">

                      <div className="acm-crop-icon">
                        🌱
                      </div>

                      <div>

                        <h3>
                          {crop.name}
                        </h3>

                        <span>
                          {crop.category ||
                            "Crop"}
                        </span>

                      </div>

                    </div>

                    <div className="acm-unit">
                      {crop.unit || "kg"}
                    </div>

                  </div>


                  {/* PROGRESS */}

                  <div className="acm-progress-area">

                    <div className="acm-progress-head">

                      <span>
                        Production Usage
                      </span>

                      <strong>
                        {Number(
                          crop.production || 0
                        ) > 0
                          ? Math.round(
                              ((Number(
                                crop.stored || 0
                              ) +
                                Number(
                                  crop.sold || 0
                                )) /
                                Number(
                                  crop.production ||
                                    1
                                )) *
                                100
                            )
                          : 0}
                        %
                      </strong>

                    </div>

                    <div className="acm-progress">

                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              Number(
                                crop.production ||
                                  0
                              ) > 0
                                ? ((Number(
                                    crop.stored ||
                                      0
                                  ) +
                                    Number(
                                      crop.sold ||
                                        0
                                    )) /
                                    Number(
                                      crop.production ||
                                        1
                                    )) *
                                    100
                                : 0
                            )
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* VALUES */}

                  <div className="acm-values">

                    <div>

                      <span>
                        PRODUCTION
                      </span>

                      <strong>
                        {Number(
                          crop.production || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        STORED
                      </span>

                      <strong>
                        {Number(
                          crop.stored || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        SOLD
                      </span>

                      <strong>
                        {Number(
                          crop.sold || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div className="available">

                      <span>
                        AVAILABLE
                      </span>

                      <strong>
                        {available.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* DATES */}

                  <div className="acm-dates">

                    <div>

                      <span>
                        🌱 Planting
                      </span>

                      <strong>
                        {crop.plantingDate
                          ? new Date(
                              crop.plantingDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "Not set"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        🌾 Harvest
                      </span>

                      <strong>
                        {crop.harvestDate
                          ? new Date(
                              crop.harvestDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "Not set"}
                      </strong>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="acm-card-actions">

                    <button
                      type="button"
                      className="acm-edit"
                      onClick={() =>
                        openEditForm(crop)
                      }
                    >
                      ✎ Edit
                    </button>

                    <button
                      type="button"
                      className="acm-delete"
                      onClick={() =>
                        setDeleteId(
                          crop._id
                        )
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>


      {/* DELETE MODAL */}

      {deleteId && (

        <div className="acm-modal-backdrop">

          <div className="acm-modal">

            <div className="acm-modal-icon">
              ⚠️
            </div>

            <h2>
              Delete this crop?
            </h2>

            <p>
              This crop record will be permanently
              removed from your account.
            </p>

            <div className="acm-modal-actions">

              <button
                type="button"
                className="acm-cancel"
                onClick={() =>
                  setDeleteId(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="acm-delete-confirm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Crop"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}