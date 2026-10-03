import { useEffect, useMemo, useState } from "react";
import { get, put } from "../api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await get("/products/my-products");

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setProducts(data);
    } catch (err) {
      setError(
        err?.message || "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const startEdit = (product) => {
    setEditingId(product._id);
    setQuantity(product.quantity ?? "");
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setQuantity("");
  };

  const updateQuantity = async (product) => {
    const newQuantity = Number(quantity);

    if (Number.isNaN(newQuantity) || newQuantity < 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await put(`/products/${product._id}`, {
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: newQuantity,
        unit: product.unit || "kg",
        location: product.location || "",
        description: product.description || "",
        emoji: product.emoji || "🌱",
      });

      setMessage(
        `${product.name} stock updated successfully.`
      );

      setEditingId(null);
      setQuantity("");

      await loadInventory();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update inventory."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.category || "")
          .toLowerCase()
          .includes(query);

      const stock = Number(product.quantity || 0);

      let matchesFilter = true;

      if (filter === "In Stock") {
        matchesFilter = stock > 0;
      }

      if (filter === "Low Stock") {
        matchesFilter =
          stock > 0 && stock <= 10;
      }

      if (filter === "Out of Stock") {
        matchesFilter = stock <= 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const stats = useMemo(() => {
    let totalQuantity = 0;
    let totalValue = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((product) => {
      const quantity = Number(
        product.quantity || 0
      );

      const price = Number(
        product.price || 0
      );

      totalQuantity += quantity;
      totalValue += quantity * price;

      if (quantity <= 0) {
        outOfStock++;
      } else if (quantity <= 10) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      totalProducts: products.length,
      totalQuantity,
      totalValue,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const getStockClass = (quantity) => {
    const value = Number(quantity || 0);

    if (value <= 0) return "ami-stock-danger";
    if (value <= 10) return "ami-stock-warning";

    return "ami-stock-good";
  };

  const getStockLabel = (quantity) => {
    const value = Number(quantity || 0);

    if (value <= 0) return "OUT OF STOCK";
    if (value <= 10) return "LOW STOCK";

    return "IN STOCK";
  };

  if (loading) {
    return (
      <div className="ami-page">
        <div className="ami-loading">
          <div className="ami-loading-icon">
            📦
          </div>

          <h2>Loading inventory...</h2>

          <p>
            Checking your current farm stock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ami-page">

      {/* HEADER */}

      <header className="ami-header">

        <div>
          <span className="ami-eyebrow">
            FARM INVENTORY
          </span>

          <h1>Inventory</h1>

          <p>
            Track your available produce,
            monitor stock levels and update
            quantities.
          </p>
        </div>

        <button
          type="button"
          className="ami-refresh"
          onClick={loadInventory}
        >
          ↻ Refresh
        </button>

      </header>


      {/* ALERTS */}

      {message && (
        <div className="ami-alert ami-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="ami-alert ami-error">
          ⚠ {error}
        </div>
      )}


      {/* STATISTICS */}

      <section className="ami-stats">

        <div className="ami-stat-card">

          <div className="ami-stat-icon green">
            📦
          </div>

          <div>
            <span>PRODUCTS</span>

            <strong>
              {stats.totalProducts}
            </strong>

            <small>
              Listed products
            </small>
          </div>

        </div>


        <div className="ami-stat-card">

          <div className="ami-stat-icon blue">
            ⚖
          </div>

          <div>
            <span>TOTAL STOCK</span>

            <strong>
              {stats.totalQuantity.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Combined quantity
            </small>
          </div>

        </div>


        <div className="ami-stat-card">

          <div className="ami-stat-icon orange">
            ⚠
          </div>

          <div>
            <span>LOW STOCK</span>

            <strong>
              {stats.lowStock}
            </strong>

            <small>
              Needs attention
            </small>
          </div>

        </div>


        <div className="ami-stat-card">

          <div className="ami-stat-icon red">
            !
          </div>

          <div>
            <span>OUT OF STOCK</span>

            <strong>
              {stats.outOfStock}
            </strong>

            <small>
              Currently unavailable
            </small>
          </div>

        </div>

      </section>


      {/* INVENTORY VALUE */}

      <section className="ami-value-banner">

        <div className="ami-value-icon">
          ₹
        </div>

        <div>
          <span>
            ESTIMATED INVENTORY VALUE
          </span>

          <strong>
            ₹
            {stats.totalValue.toLocaleString(
              "en-IN"
            )}
          </strong>

          <p>
            Based on current listed prices
            and available quantities.
          </p>
        </div>

      </section>


      {/* TOOLBAR */}

      <section className="ami-inventory-section">

        <div className="ami-section-title">

          <div>
            <span>STOCK MANAGEMENT</span>

            <h2>
              Current Inventory
            </h2>

            <p>
              Update your stock whenever
              produce is sold or harvested.
            </p>
          </div>

        </div>


        <div className="ami-toolbar">

          <div className="ami-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="ami-filters">

            {[
              "All",
              "In Stock",
              "Low Stock",
              "Out of Stock",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filter === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>
            ))}

          </div>

        </div>


        {/* TABLE */}

        {filteredProducts.length === 0 ? (

          <div className="ami-empty">

            <div className="ami-empty-icon">
              📦
            </div>

            <h3>
              No inventory found
            </h3>

            <p>
              Add products from the My Products
              page or change your search filter.
            </p>

          </div>

        ) : (

          <div className="ami-table-wrapper">

            <table className="ami-table">

              <thead>

                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>AVAILABLE STOCK</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const stock =
                      Number(
                        product.quantity || 0
                      );

                    const isEditing =
                      editingId ===
                      product._id;

                    return (
                      <tr
                        key={product._id}
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="ami-product">

                            <div className="ami-product-icon">
                              {product.emoji ||
                                "🌱"}
                            </div>

                            <div>
                              <strong>
                                {product.name}
                              </strong>

                              {product.location && (
                                <small>
                                  📍{" "}
                                  {
                                    product.location
                                  }
                                </small>
                              )}
                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="ami-category">
                            {product.category ||
                              "Produce"}
                          </span>

                        </td>


                        {/* PRICE */}

                        <td>

                          <strong className="ami-price">
                            ₹
                            {Number(
                              product.price ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <small>
                            /{" "}
                            {product.unit ||
                              "kg"}
                          </small>

                        </td>


                        {/* QUANTITY */}

                        <td>

                          {isEditing ? (

                            <div className="ami-edit-stock">

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  setQuantity(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                autoFocus
                              />

                              <span>
                                {product.unit ||
                                  "kg"}
                              </span>

                            </div>

                          ) : (

                            <div className="ami-quantity">

                              <strong>
                                {stock.toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                              <span>
                                {product.unit ||
                                  "kg"}
                              </span>

                            </div>

                          )}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`ami-stock-status ${getStockClass(
                              stock
                            )}`}
                          >
                            <i />
                            {getStockLabel(
                              stock
                            )}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          {isEditing ? (

                            <div className="ami-actions">

                              <button
                                type="button"
                                className="ami-save"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  updateQuantity(
                                    product
                                  )
                                }
                              >
                                {saving
                                  ? "Saving..."
                                  : "Save"}
                              </button>

                              <button
                                type="button"
                                className="ami-cancel"
                                disabled={
                                  saving
                                }
                                onClick={
                                  cancelEdit
                                }
                              >
                                Cancel
                              </button>

                            </div>

                          ) : (

                            <button
                              type="button"
                              className="ami-edit"
                              onClick={() =>
                                startEdit(
                                  product
                                )
                              }
                            >
                              ✎ Update
                            </button>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* STOCK GUIDE */}

      <section className="ami-guide">

        <div className="ami-guide-heading">

          <span>
            INVENTORY GUIDE
          </span>

          <h2>
            Keep your stock accurate
          </h2>

        </div>


        <div className="ami-guide-grid">

          <div className="ami-guide-item">

            <span className="good-dot" />

            <div>
              <strong>
                In Stock
              </strong>

              <p>
                More than 10 units available.
              </p>
            </div>

          </div>


          <div className="ami-guide-item">

            <span className="warning-dot" />

            <div>
              <strong>
                Low Stock
              </strong>

              <p>
                10 units or fewer remaining.
              </p>
            </div>

          </div>


          <div className="ami-guide-item">

            <span className="danger-dot" />

            <div>
              <strong>
                Out of Stock
              </strong>

              <p>
                No quantity currently available.
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}