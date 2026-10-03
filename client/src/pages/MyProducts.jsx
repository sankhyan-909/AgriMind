import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api";

const INITIAL_FORM = {
  name: "",
  category: "Vegetable",
  price: "",
  quantity: "",
  unit: "kg",
  location: "",
  description: "",
  emoji: "🌱",
};

const CATEGORIES = [
  "Vegetable",
  "Fruit",
  "Grain",
  "Pulse",
  "Oilseed",
];

const UNITS = ["kg", "quintal", "ton"];

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await get("/products/my-products");

      setProducts(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================================================
  // FORM HELPERS
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const startEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      category: product.category || "Vegetable",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      unit: product.unit || "kg",
      location: product.location || "",
      description: product.description || "",
      emoji: product.emoji || "🌱",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    if (saving) return;

    resetForm();
    setMessage("");
    setError("");
  };

  // =========================================================
  // SAVE PRODUCT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const name = form.name.trim();
      const price = Number(form.price);
      const quantity = Number(form.quantity);

      if (!name) {
        throw new Error(
          "Please enter a product name."
        );
      }

      if (
        Number.isNaN(price) ||
        price < 0
      ) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      if (
        Number.isNaN(quantity) ||
        quantity < 0
      ) {
        throw new Error(
          "Please enter a valid quantity."
        );
      }

      const payload = {
        name,
        category: form.category,
        price,
        quantity,
        unit: form.unit,
        location: form.location.trim(),
        description: form.description.trim(),
        emoji: form.emoji.trim() || "🌱",
      };

      let response;

      if (editingId) {
        response = await put(
          `/products/${editingId}`,
          payload
        );
      } else {
        response = await post(
          "/products",
          payload
        );
      }

      setMessage(
        response?.message ||
          (editingId
            ? "Product updated successfully."
            : "Product added successfully.")
      );

      resetForm();

      await loadProducts();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save product."
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
    setMessage("");
    setError("");

    try {
      const response = await del(
        `/products/${deleteId}`
      );

      setMessage(
        response?.message ||
          "Product deleted successfully."
      );

      setDeleteId(null);

      if (editingId === deleteId) {
        resetForm();
      }

      await loadProducts();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete product."
      );

      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // FILTERING
  // =========================================================

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.category || "")
          .toLowerCase()
          .includes(query) ||
        String(product.location || "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    const active = products.filter(
      (product) =>
        product.status === "Active"
    );

    const outOfStock = products.filter(
      (product) =>
        product.status === "Out of Stock"
    );

    const totalQuantity =
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.quantity || 0),
        0
      );

    const totalValue =
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.price || 0) *
            Number(product.quantity || 0),
        0
      );

    return {
      total: products.length,
      active: active.length,
      outOfStock: outOfStock.length,
      totalQuantity,
      totalValue,
    };
  }, [products]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="amp-page">
        <div className="amp-loading">
          <div className="amp-loading-icon">
            🛒
          </div>

          <h2>
            Loading your marketplace...
          </h2>

          <p>
            Fetching your product listings.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="amp-page">

      {/* HEADER */}

      <header className="amp-header">

        <div>
          <span className="amp-eyebrow">
            FARMER MARKETPLACE
          </span>

          <h1>
            My Products
          </h1>

          <p>
            Manage the products you sell
            directly through AgriMind.
          </p>
        </div>

        <div className="amp-header-count">
          <strong>
            {stats.total}
          </strong>

          <span>
            Total Listings
          </span>
        </div>

      </header>


      {/* ALERTS */}

      {message && (
        <div className="amp-alert amp-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="amp-alert amp-error">
          <span>⚠</span>
          {error}
        </div>
      )}


      {/* STATISTICS */}

      <section className="amp-stats">

        <div className="amp-stat">

          <div className="amp-stat-icon green">
            🛒
          </div>

          <div>
            <span>
              TOTAL LISTINGS
            </span>

            <strong>
              {stats.total}
            </strong>

            <small>
              Products listed
            </small>
          </div>

        </div>


        <div className="amp-stat">

          <div className="amp-stat-icon blue">
            ✓
          </div>

          <div>
            <span>
              ACTIVE
            </span>

            <strong>
              {stats.active}
            </strong>

            <small>
              Available for buyers
            </small>
          </div>

        </div>


        <div className="amp-stat">

          <div className="amp-stat-icon orange">
            📦
          </div>

          <div>
            <span>
              STOCK
            </span>

            <strong>
              {stats.totalQuantity.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Total quantity
            </small>
          </div>

        </div>


        <div className="amp-stat">

          <div className="amp-stat-icon purple">
            ₹
          </div>

          <div>
            <span>
              INVENTORY VALUE
            </span>

            <strong>
              ₹
              {stats.totalValue.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Current listed value
            </small>
          </div>

        </div>

      </section>


      {/* ADD / EDIT PRODUCT */}

      <section className="amp-form-card">

        <div className="amp-form-heading">

          <div>

            <span>
              {editingId
                ? "UPDATE LISTING"
                : "NEW LISTING"}
            </span>

            <h2>
              {editingId
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p>
              Add fresh farm produce to your
              marketplace listing.
            </p>

          </div>

          {editingId && (
            <button
              type="button"
              className="amp-cancel-top"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel Edit
            </button>
          )}

        </div>


        <form
          className="amp-form"
          onSubmit={handleSubmit}
        >

          <div className="amp-field">

            <label>
              Product Name
            </label>

            <input
              name="name"
              type="text"
              placeholder="e.g. Fresh Tomatoes"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>


          <div className="amp-field">

            <label>
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

          </div>


          <div className="amp-field">

            <label>
              Price
            </label>

            <div className="amp-input-prefix">

              <span>₹</span>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="120"
                value={form.price}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <div className="amp-field">

            <label>
              Quantity
            </label>

            <input
              name="quantity"
              type="number"
              min="0"
              step="0.01"
              placeholder="100"
              value={form.quantity}
              onChange={handleChange}
              required
            />

          </div>


          <div className="amp-field">

            <label>
              Unit
            </label>

            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >
              {UNITS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

          </div>


          <div className="amp-field">

            <label>
              Location
            </label>

            <input
              name="location"
              type="text"
              placeholder="e.g. Solan, Himachal Pradesh"
              value={form.location}
              onChange={handleChange}
            />

          </div>


          <div className="amp-field">

            <label>
              Product Icon
            </label>

            <input
              name="emoji"
              type="text"
              maxLength="4"
              placeholder="🌱"
              value={form.emoji}
              onChange={handleChange}
            />

          </div>


          <div className="amp-field">

            <label>
              Description
            </label>

            <input
              name="description"
              type="text"
              placeholder="Fresh farm-grown produce..."
              value={form.description}
              onChange={handleChange}
            />

          </div>


          {/* PREVIEW */}

          <div className="amp-preview">

            <div className="amp-preview-icon">
              {form.emoji || "🌱"}
            </div>

            <div className="amp-preview-info">

              <span>
                LISTING PREVIEW
              </span>

              <strong>
                {form.name ||
                  "Your Product Name"}
              </strong>

              <small>
                {form.category} ·{" "}
                {form.location ||
                  "Location not specified"}
              </small>

            </div>

            <div className="amp-preview-price">

              <strong>
                ₹
                {Number(
                  form.price || 0
                ).toLocaleString("en-IN")}
              </strong>

              <span>
                / {form.unit}
              </span>

            </div>

          </div>


          {/* SUBMIT */}

          <div className="amp-form-actions">

            <button
              type="submit"
              className="amp-save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

          </div>

        </form>

      </section>


      {/* PRODUCT LIST */}

      <section className="amp-products-section">

        <div className="amp-section-header">

          <div>

            <span>
              YOUR INVENTORY
            </span>

            <h2>
              Live Marketplace Listings
            </h2>

            <p>
              Products shown here are available
              to buyers on the AgriMind marketplace.
            </p>

          </div>

          <button
            type="button"
            className="amp-refresh"
            onClick={loadProducts}
          >
            ↻ Refresh
          </button>

        </div>


        {/* SEARCH + FILTER */}

        <div className="amp-toolbar">

          <div className="amp-search">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search your products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="amp-filters">

            {[
              "All",
              ...CATEGORIES,
            ].map((item) => (

              <button
                type="button"
                key={item}
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        {/* PRODUCTS */}

        {filteredProducts.length === 0 ? (

          <div className="amp-empty">

            <div className="amp-empty-icon">
              🛒
            </div>

            <h3>
              {products.length === 0
                ? "No products listed yet"
                : "No products found"}
            </h3>

            <p>
              {products.length === 0
                ? "Add your first product above and make it available to buyers."
                : "Try changing your search or category filter."}
            </p>

          </div>

        ) : (

          <div className="amp-product-grid">

            {filteredProducts.map(
              (product) => (

                <article
                  className="amp-product-card"
                  key={product._id}
                >

                  {/* IMAGE / ICON */}

                  <div className="amp-product-image">

                    <div className="amp-product-emoji">
                      {product.emoji ||
                        "🌱"}
                    </div>

                    <span
                      className={
                        product.status ===
                        "Active"
                          ? "amp-status active"
                          : product.status ===
                            "Out of Stock"
                          ? "amp-status out"
                          : "amp-status inactive"
                      }
                    >
                      {product.status ||
                        "Active"}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="amp-product-body">

                    <span className="amp-category">
                      {product.category ||
                        "Produce"}
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <div className="amp-price-row">

                      <strong>
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <span>
                        / {product.unit ||
                          "kg"}
                      </span>

                    </div>


                    <div className="amp-stock">

                      <div>
                        <span>
                          AVAILABLE
                        </span>

                        <strong>
                          {Number(
                            product.quantity ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}{" "}
                          {product.unit ||
                            "kg"}
                        </strong>
                      </div>

                    </div>


                    {product.location && (
                      <div className="amp-location">
                        📍{" "}
                        {product.location}
                      </div>
                    )}


                    {product.description && (
                      <p className="amp-description">
                        {product.description}
                      </p>
                    )}


                    {/* ACTIONS */}

                    <div className="amp-card-actions">

                      <button
                        type="button"
                        className="amp-edit"
                        onClick={() =>
                          startEdit(
                            product
                          )
                        }
                      >
                        ✎ Edit
                      </button>

                      <button
                        type="button"
                        className="amp-delete"
                        onClick={() =>
                          setDeleteId(
                            product._id
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* DELETE MODAL */}

      {deleteId && (

        <div className="amp-modal-backdrop">

          <div className="amp-modal">

            <div className="amp-modal-icon">
              🗑️
            </div>

            <h2>
              Delete this product?
            </h2>

            <p>
              This listing will be removed
              from the marketplace permanently.
            </p>

            <div className="amp-modal-actions">

              <button
                type="button"
                className="amp-modal-cancel"
                onClick={() =>
                  setDeleteId(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="amp-modal-delete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Product"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}