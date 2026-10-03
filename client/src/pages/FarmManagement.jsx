import { useEffect, useState } from "react";
import { del, get, post, put } from "../api";

const EMPTY_FORM = {
  name: "",
  location: "",
  area: "",
  unit: "Acres",
  soilType: "",
  irrigation: "Tube Well",
};

export default function FarmManagement() {
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD FARMS
  // =========================================================

  const loadFarms = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await get("/farms");
      setFarms(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err?.message || "Unable to load your farms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditForm = (farm) => {
    setEditingId(farm._id);

    setForm({
      name: farm.name || "",
      location: farm.location || "",
      area: farm.area ?? "",
      unit: farm.unit || "Acres",
      soilType: farm.soilType || "",
      irrigation: farm.irrigation || "Tube Well",
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
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // =========================================================
  // SAVE FARM
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        area: Number(form.area),
        unit: form.unit,
        soilType: form.soilType.trim(),
        irrigation: form.irrigation,
      };

      if (!payload.name) {
        throw new Error("Please enter a farm name.");
      }

      if (!payload.location) {
        throw new Error("Please enter the farm location.");
      }

      if (!payload.area || payload.area <= 0) {
        throw new Error(
          "Please enter a valid farm area."
        );
      }

      let result;

      if (editingId) {
        result = await put(
          `/farms/${editingId}`,
          payload
        );
      } else {
        result = await post("/farms", payload);
      }

      setMessage(
        result?.message ||
          (editingId
            ? "Farm updated successfully."
            : "Farm added successfully.")
      );

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadFarms();
    } catch (err) {
      setError(
        err?.message || "Unable to save farm."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE FARM
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const result = await del(
        `/farms/${deleteId}`
      );

      setMessage(
        result?.message ||
          "Farm deleted successfully."
      );

      setDeleteId(null);

      if (editingId === deleteId) {
        setEditingId(null);
        setShowForm(false);
        setForm(EMPTY_FORM);
      }

      await loadFarms();
    } catch (err) {
      setError(
        err?.message || "Unable to delete farm."
      );
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalArea = farms.reduce(
    (total, farm) => {
      const area = Number(farm.area || 0);

      if (farm.unit === "Hectares") {
        return total + area * 2.47105;
      }

      return total + area;
    },
    0
  );

  const activeFarms = farms.filter(
    (farm) =>
      String(farm.status || "Active").toLowerCase() ===
      "active"
  ).length;

  const totalCrops = farms.reduce(
    (total, farm) =>
      total +
      (Array.isArray(farm.crops)
        ? farm.crops.length
        : 0),
    0
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="afm-page">
        <div className="afm-loading">
          <div className="afm-loading-icon">
            🚜
          </div>

          <h2>
            Loading your farms...
          </h2>

          <p>
            Fetching your latest farm records.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="afm-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="afm-header">

        <div>

          <span className="afm-eyebrow">
            FARMER PORTAL
          </span>

          <h1>
            Farm Management
          </h1>

          <p>
            Manage your farms, land details and
            agricultural information.
          </p>

        </div>

        <button
          type="button"
          className="afm-add-btn"
          onClick={openAddForm}
        >
          <span>＋</span>
          Add Farm
        </button>

      </header>


      {/* =====================================================
          ALERTS
      ===================================================== */}

      {message && (
        <div className="afm-alert afm-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="afm-alert afm-error">
          <span>⚠</span>
          {error}
        </div>
      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="afm-summary">

        <div className="afm-summary-card">

          <div className="afm-summary-icon green">
            🚜
          </div>

          <div>

            <span>
              TOTAL FARMS
            </span>

            <strong>
              {farms.length}
            </strong>

            <small>
              Registered farms
            </small>

          </div>

        </div>


        <div className="afm-summary-card">

          <div className="afm-summary-icon yellow">
            🌾
          </div>

          <div>

            <span>
              TOTAL FARM AREA
            </span>

            <strong>
              {totalArea.toFixed(1)}
            </strong>

            <small>
              Approx. acres
            </small>

          </div>

        </div>


        <div className="afm-summary-card">

          <div className="afm-summary-icon blue">
            🌱
          </div>

          <div>

            <span>
              REGISTERED CROPS
            </span>

            <strong>
              {totalCrops}
            </strong>

            <small>
              Across your farms
            </small>

          </div>

        </div>


        <div className="afm-summary-card">

          <div className="afm-summary-icon orange">
            ✓
          </div>

          <div>

            <span>
              ACTIVE FARMS
            </span>

            <strong>
              {activeFarms}
            </strong>

            <small>
              Currently active
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (
        <section className="afm-form-card">

          <div className="afm-form-header">

            <div>

              <span>
                {editingId
                  ? "UPDATE FARM"
                  : "NEW FARM"}
              </span>

              <h2>
                {editingId
                  ? "Edit Farm Details"
                  : "Add a New Farm"}
              </h2>

              <p>
                Enter the details of your agricultural
                land below.
              </p>

            </div>

            <button
              type="button"
              className="afm-close"
              onClick={closeForm}
              disabled={saving}
            >
              ×
            </button>

          </div>


          <form
            className="afm-form"
            onSubmit={handleSubmit}
          >

            <div className="afm-field">

              <label htmlFor="farm-name">
                Farm Name
              </label>

              <input
                id="farm-name"
                name="name"
                type="text"
                placeholder="e.g. Green Valley Farm"
                value={form.name}
                onChange={handleChange}
                required
              />

            </div>


            <div className="afm-field">

              <label htmlFor="farm-location">
                Location
              </label>

              <input
                id="farm-location"
                name="location"
                type="text"
                placeholder="e.g. Baddi, Himachal Pradesh"
                value={form.location}
                onChange={handleChange}
                required
              />

            </div>


            <div className="afm-field">

              <label htmlFor="farm-area">
                Farm Area
              </label>

              <input
                id="farm-area"
                name="area"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12"
                value={form.area}
                onChange={handleChange}
                required
              />

            </div>


            <div className="afm-field">

              <label htmlFor="farm-unit">
                Area Unit
              </label>

              <select
                id="farm-unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
              >
                <option value="Acres">
                  Acres
                </option>

                <option value="Hectares">
                  Hectares
                </option>
              </select>

            </div>


            <div className="afm-field">

              <label htmlFor="farm-soil">
                Soil Type
              </label>

              <input
                id="farm-soil"
                name="soilType"
                type="text"
                placeholder="e.g. Alluvial Soil"
                value={form.soilType}
                onChange={handleChange}
              />

            </div>


            <div className="afm-field">

              <label htmlFor="farm-irrigation">
                Irrigation Method
              </label>

              <select
                id="farm-irrigation"
                name="irrigation"
                value={form.irrigation}
                onChange={handleChange}
              >
                <option value="Tube Well">
                  Tube Well
                </option>

                <option value="Canal">
                  Canal
                </option>

                <option value="Drip">
                  Drip
                </option>

                <option value="Rainfed">
                  Rainfed
                </option>
              </select>

            </div>


            <div className="afm-form-actions">

              <button
                type="button"
                className="afm-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="afm-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Farm"
                  : "Save Farm"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* =====================================================
          FARM LIST
      ===================================================== */}

      <section className="afm-list-section">

        <div className="afm-list-header">

          <div>

            <span>
              YOUR LAND
            </span>

            <h2>
              My Farms
            </h2>

            <p>
              All farms registered under your account.
            </p>

          </div>

          <button
            type="button"
            className="afm-refresh"
            onClick={loadFarms}
          >
            ↻ Refresh
          </button>

        </div>


        {farms.length === 0 ? (

          <div className="afm-empty">

            <div className="afm-empty-icon">
              🚜
            </div>

            <h3>
              No farms added yet
            </h3>

            <p>
              Start by adding your first farm and
              keep all your agricultural information
              organised in one place.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="afm-add-btn"
            >
              ＋ Add Your First Farm
            </button>

          </div>

        ) : (

          <div className="afm-grid">

            {farms.map((farm) => {

              const crops = Array.isArray(
                farm.crops
              )
                ? farm.crops
                : [];

              const status =
                farm.status || "Active";

              return (

                <article
                  className="afm-card"
                  key={farm._id}
                >

                  {/* CARD HEADER */}

                  <div className="afm-card-header">

                    <div className="afm-card-title">

                      <div className="afm-card-icon">
                        🚜
                      </div>

                      <div>

                        <h3>
                          {farm.name}
                        </h3>

                        <p>
                          📍{" "}
                          {farm.location ||
                            "Location not specified"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={
                        String(status)
                          .toLowerCase() ===
                        "active"
                          ? "afm-status active"
                          : "afm-status"
                      }
                    >
                      {status}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="afm-details">

                    <div>

                      <span>
                        FARM AREA
                      </span>

                      <strong>
                        {farm.area || 0}{" "}
                        {farm.unit || "Acres"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        SOIL TYPE
                      </span>

                      <strong>
                        {farm.soilType ||
                          "Not specified"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        IRRIGATION
                      </span>

                      <strong>
                        {farm.irrigation ||
                          "Not specified"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        CROPS
                      </span>

                      <strong>
                        {crops.length}
                      </strong>

                    </div>

                  </div>


                  {/* CROPS */}

                  <div className="afm-crops">

                    <h4>
                      🌱 Crops on this farm
                    </h4>

                    {crops.length > 0 ? (

                      <div className="afm-tags">

                        {crops.map(
                          (crop, index) => (
                            <span
                              key={`${crop}-${index}`}
                            >
                              {crop}
                            </span>
                          )
                        )}

                      </div>

                    ) : (

                      <p>
                        No crops linked to this
                        farm yet.
                      </p>

                    )}

                  </div>


                  {/* ACTIONS */}

                  <div className="afm-card-actions">

                    <button
                      type="button"
                      className="afm-edit-btn"
                      onClick={() =>
                        openEditForm(farm)
                      }
                    >
                      ✎ Edit Farm
                    </button>

                    <button
                      type="button"
                      className="afm-delete-btn"
                      onClick={() =>
                        setDeleteId(farm._id)
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


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteId && (

        <div className="afm-modal-backdrop">

          <div className="afm-modal">

            <div className="afm-modal-icon">
              ⚠️
            </div>

            <h2>
              Delete this farm?
            </h2>

            <p>
              This farm record will be permanently
              removed from your account.
            </p>

            <div className="afm-modal-actions">

              <button
                type="button"
                className="afm-cancel-btn"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="afm-delete-confirm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Farm"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}