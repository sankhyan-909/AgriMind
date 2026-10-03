import { useEffect, useMemo, useState } from "react";
import { get, put } from "../api";

const STATUS_OPTIONS = [
  "New",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
];

function formatMoney(value) {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayStatus(status) {
  if (status === "Placed") return "New";
  return status || "New";
}

function getStatusClass(status) {
  const normalized = getDisplayStatus(status)
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `afo-status-${normalized}`;
}

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await get("/orders/farmer");

      setOrders(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Failed to load farmer orders:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId);
      setMessage("");
      setError("");

      const response = await put(
        `/orders/farmer/${orderId}/status`,
        {
          status,
        }
      );

      setMessage(
        response?.message ||
          "Order status updated successfully."
      );

      await loadOrders();

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((previous) =>
          previous
            ? {
                ...previous,
                status,
              }
            : null
        );
      }
    } catch (err) {
      console.error(
        "Failed to update order status:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const displayStatus = getDisplayStatus(
        order.status
      );

      const matchesStatus =
        statusFilter === "All" ||
        displayStatus === statusFilter;

      if (!matchesStatus) return false;

      if (!query) return true;

      const buyerName =
        order.buyer?.name || "";

      const buyerPhone =
        order.buyer?.phone || "";

      const orderNumber =
        order.orderNumber || "";

      const productNames = (order.items || [])
        .map((item) => item.name || "")
        .join(" ");

      const searchable = `
        ${buyerName}
        ${buyerPhone}
        ${orderNumber}
        ${productNames}
      `.toLowerCase();

      return searchable.includes(query);
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;

    const newOrders = orders.filter(
      (order) =>
        getDisplayStatus(order.status) === "New"
    ).length;

    const processing = orders.filter(
      (order) =>
        getDisplayStatus(order.status) ===
        "Processing"
    ).length;

    const delivered = orders.filter(
      (order) =>
        getDisplayStatus(order.status) ===
          "Delivered" ||
        getDisplayStatus(order.status) ===
          "Completed"
    ).length;

    const cancelled = orders.filter(
      (order) =>
        getDisplayStatus(order.status) ===
        "Cancelled"
    ).length;

    const revenue = orders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

    return {
      total,
      newOrders,
      processing,
      delivered,
      cancelled,
      revenue,
    };
  }, [orders]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  return (
    <div className="afo-page">
      <div className="afo-container">

        {/* HERO */}
        <section className="afo-hero">

          <div className="afo-hero-content">
            <span className="afo-eyebrow">
              FARMER SALES CENTER
            </span>

            <h1>
              Manage your
              <br />
              <span>Orders.</span>
            </h1>

            <p>
              Track buyer purchases, update delivery
              progress, and keep every sale organized
              from one place.
            </p>

            <div className="afo-hero-actions">
              <button
                type="button"
                className="afo-primary-btn"
                onClick={loadOrders}
                disabled={loading}
              >
                <span>↻</span>
                {loading
                  ? "Refreshing..."
                  : "Refresh Orders"}
              </button>

              <div className="afo-order-count">
                <strong>{stats.total}</strong>
                <span>Total Orders</span>
              </div>
            </div>
          </div>

          <div className="afo-hero-visual">
            <div className="afo-package-card">
              <div className="afo-package-icon">
                📦
              </div>

              <div>
                <span>FARMER ORDERS</span>
                <strong>
                  {stats.total}
                </strong>
              </div>
            </div>

            <div className="afo-floating-card afo-float-one">
              🌾
              <span>Fresh Produce</span>
            </div>

            <div className="afo-floating-card afo-float-two">
              ✓
              <span>Delivered</span>
            </div>
          </div>
        </section>

        {/* ALERTS */}
        {message && (
          <div className="afo-message afo-success">
            <span>✓</span>
            <p>{message}</p>

            <button
              type="button"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="afo-message afo-error">
            <span>!</span>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="afo-stats">

          <div className="afo-stat-card">
            <div className="afo-stat-icon green">
              📦
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{stats.total}</strong>
              <small>All buyer orders</small>
            </div>
          </div>

          <div className="afo-stat-card">
            <div className="afo-stat-icon orange">
              🔔
            </div>

            <div>
              <span>New Orders</span>
              <strong>{stats.newOrders}</strong>
              <small>Need attention</small>
            </div>
          </div>

          <div className="afo-stat-card">
            <div className="afo-stat-icon blue">
              🚚
            </div>

            <div>
              <span>Processing</span>
              <strong>{stats.processing}</strong>
              <small>Currently moving</small>
            </div>
          </div>

          <div className="afo-stat-card">
            <div className="afo-stat-icon purple">
              ₹
            </div>

            <div>
              <span>Order Value</span>
              <strong>
                {formatMoney(stats.revenue)}
              </strong>
              <small>Total order value</small>
            </div>
          </div>

        </section>

        {/* STATUS OVERVIEW */}
        <section className="afo-overview">

          <div className="afo-overview-heading">
            <div>
              <span className="afo-section-kicker">
                SALES OVERVIEW
              </span>

              <h2>
                Order Pipeline
              </h2>
            </div>

            <div className="afo-overview-total">
              {stats.delivered} completed
            </div>
          </div>

          <div className="afo-pipeline">

            <div className="afo-pipeline-item">
              <div className="afo-pipeline-number green">
                {stats.newOrders}
              </div>

              <div>
                <strong>New</strong>
                <span>Awaiting action</span>
              </div>
            </div>

            <div className="afo-pipeline-line"></div>

            <div className="afo-pipeline-item">
              <div className="afo-pipeline-number blue">
                {stats.processing}
              </div>

              <div>
                <strong>Processing</strong>
                <span>Being prepared</span>
              </div>
            </div>

            <div className="afo-pipeline-line"></div>

            <div className="afo-pipeline-item">
              <div className="afo-pipeline-number purple">
                {stats.delivered}
              </div>

              <div>
                <strong>Delivered</strong>
                <span>Successfully completed</span>
              </div>
            </div>

            <div className="afo-pipeline-line"></div>

            <div className="afo-pipeline-item">
              <div className="afo-pipeline-number red">
                {stats.cancelled}
              </div>

              <div>
                <strong>Cancelled</strong>
                <span>Cancelled orders</span>
              </div>
            </div>

          </div>
        </section>

        {/* ORDERS */}
        <section className="afo-orders-section">

          <div className="afo-section-header">
            <div>
              <span className="afo-section-kicker">
                BUYER ORDERS
              </span>

              <h2>
                Recent Orders
              </h2>

              <p>
                Every checkout containing your products
                appears here.
              </p>
            </div>

            <div className="afo-result-count">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </div>
          </div>

          {/* FILTERS */}
          <div className="afo-filters">

            <div className="afo-search">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order number, buyer, phone or product..."
              />
            </div>

            <div className="afo-status-filters">
              {[
                "All",
                "New",
                "Processing",
                "Out for Delivery",
                "Delivered",
                "Completed",
                "Cancelled",
              ].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    statusFilter === status
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {status}
                </button>
              ))}
            </div>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                className="afo-clear-filter"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}

          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="afo-state">
              <div className="afo-spinner"></div>

              <h3>
                Loading your orders...
              </h3>

              <p>
                Getting the latest buyer orders.
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="afo-state">
              <div className="afo-empty-icon">
                📦
              </div>

              <h3>
                No buyer orders yet
              </h3>

              <p>
                Orders will appear here when a buyer
                checks out one of your products.
              </p>

              <button
                type="button"
                className="afo-outline-btn"
                onClick={loadOrders}
              >
                Refresh
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="afo-state">
              <div className="afo-empty-icon">
                🔎
              </div>

              <h3>
                No matching orders
              </h3>

              <p>
                Try changing your search or status
                filter.
              </p>

              <button
                type="button"
                className="afo-outline-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="afo-orders-list">

              {filteredOrders.map((order) => {
                const displayStatus =
                  getDisplayStatus(order.status);

                const isUpdating =
                  updatingId === order._id;

                return (
                  <article
                    className="afo-order-card"
                    key={order._id}
                  >

                    {/* CARD HEADER */}
                    <div className="afo-order-top">

                      <div className="afo-order-reference">
                        <div className="afo-box-icon">
                          📦
                        </div>

                        <div>
                          <span>ORDER NUMBER</span>

                          <strong>
                            {order.orderNumber ||
                              "Order"}
                          </strong>

                          <small>
                            {formatDate(
                              order.createdAt
                            )}
                          </small>
                        </div>
                      </div>

                      <span
                        className={`afo-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        <i></i>
                        {displayStatus}
                      </span>

                    </div>

                    {/* BUYER */}
                    <div className="afo-buyer">

                      <div className="afo-buyer-avatar">
                        {(
                          order.buyer?.name ||
                          "B"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <span>BUYER</span>

                        <strong>
                          {order.buyer?.name ||
                            "Buyer"}
                        </strong>

                        {order.buyer?.phone && (
                          <small>
                            📞{" "}
                            {order.buyer.phone}
                          </small>
                        )}
                      </div>

                    </div>

                    {/* ITEMS */}
                    <div className="afo-items">

                      <div className="afo-items-heading">
                        <span>
                          ORDER ITEMS
                        </span>

                        <strong>
                          {(order.items || [])
                            .length}{" "}
                          {(order.items || [])
                            .length === 1
                            ? "item"
                            : "items"}
                        </strong>
                      </div>

                      <div className="afo-item-list">
                        {(order.items || []).map(
                          (item, index) => (
                            <div
                              className="afo-item"
                              key={`${order._id}-${index}`}
                            >
                              <div className="afo-item-emoji">
                                {item.emoji ||
                                  "🌱"}
                              </div>

                              <div className="afo-item-info">
                                <strong>
                                  {item.name ||
                                    "Product"}
                                </strong>

                                <span>
                                  {item.quantity}{" "}
                                  {item.unit || ""}{" "}
                                  ×{" "}
                                  {formatMoney(
                                    item.price
                                  )}
                                </span>
                              </div>

                              <strong className="afo-item-total">
                                {formatMoney(
                                  Number(
                                    item.quantity ||
                                      0
                                  ) *
                                    Number(
                                      item.price || 0
                                    )
                                )}
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="afo-order-footer">

                      <div className="afo-total">
                        <span>ORDER TOTAL</span>

                        <strong>
                          {formatMoney(
                            order.total
                          )}
                        </strong>
                      </div>

                      <div className="afo-card-actions">

                        <button
                          type="button"
                          className="afo-details-btn"
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                        >
                          View Details
                        </button>

                        {![
                          "Cancelled",
                          "Delivered",
                          "Completed",
                        ].includes(
                          order.status
                        ) && (
                          <select
                            value={displayStatus}
                            disabled={isUpdating}
                            onChange={(event) =>
                              updateStatus(
                                order._id,
                                event.target.value
                              )
                            }
                          >
                            {STATUS_OPTIONS.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>
                        )}

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* MODAL */}
        {selectedOrder && (
          <div
            className="afo-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedOrder(null);
              }
            }}
          >
            <div className="afo-modal">

              <div className="afo-modal-header">
                <div>
                  <span>
                    ORDER DETAILS
                  </span>

                  <h2>
                    {selectedOrder.orderNumber ||
                      "Order"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="afo-modal-status-row">

                <span
                  className={`afo-status ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  <i></i>
                  {getDisplayStatus(
                    selectedOrder.status
                  )}
                </span>

                <span className="afo-modal-date">
                  {formatDate(
                    selectedOrder.createdAt
                  )}
                </span>

              </div>

              <div className="afo-detail-grid">

                <div className="afo-detail-box">
                  <span>BUYER</span>
                  <strong>
                    {selectedOrder.buyer?.name ||
                      "Buyer"}
                  </strong>

                  {selectedOrder.buyer?.phone && (
                    <small>
                      📞{" "}
                      {selectedOrder.buyer.phone}
                    </small>
                  )}
                </div>

                <div className="afo-detail-box">
                  <span>PAYMENT</span>
                  <strong>
                    {selectedOrder.paymentMethod ||
                      "—"}
                  </strong>

                  <small>
                    Status:{" "}
                    {selectedOrder.paymentStatus ||
                      "—"}
                  </small>
                </div>

              </div>

              <div className="afo-address-box">
                <span>DELIVERY ADDRESS</span>

                <p>
                  {selectedOrder.customer
                    ?.address || "—"}
                  <br />

                  {selectedOrder.customer
                    ?.city || ""}
                  {selectedOrder.customer
                    ?.city &&
                  selectedOrder.customer?.state
                    ? ", "
                    : ""}
                  {selectedOrder.customer
                    ?.state || ""}

                  {selectedOrder.customer
                    ?.pincode
                    ? ` - ${selectedOrder.customer.pincode}`
                    : ""}
                </p>
              </div>

              <div className="afo-modal-items">

                <div className="afo-modal-items-title">
                  <span>ITEMS</span>
                  <span>
                    {(selectedOrder.items || [])
                      .length}{" "}
                    total
                  </span>
                </div>

                {(selectedOrder.items || []).map(
                  (item, index) => (
                    <div
                      className="afo-modal-item"
                      key={index}
                    >
                      <span className="afo-modal-emoji">
                        {item.emoji || "🌱"}
                      </span>

                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {item.quantity}{" "}
                          {item.unit || ""} ×{" "}
                          {formatMoney(item.price)}
                        </small>
                      </div>

                      <strong>
                        {formatMoney(
                          Number(
                            item.quantity || 0
                          ) *
                            Number(
                              item.price || 0
                            )
                        )}
                      </strong>
                    </div>
                  )
                )}

              </div>

              <div className="afo-modal-total">
                <span>Total</span>

                <strong>
                  {formatMoney(
                    selectedOrder.total
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="afo-close-btn"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}