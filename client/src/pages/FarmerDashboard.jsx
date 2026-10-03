import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api";

export default function FarmerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  // IMPORTANT:
  // All hooks must run before any conditional return.
  const quickActions = useMemo(
    () => [
      [
        "🚜",
        "My Farm",
        "Manage your farm records",
        "/farm-management",
      ],
      [
        "🌱",
        "Crops",
        "Track your growing crops",
        "/crop-management",
      ],
      [
        "🛒",
        "My Products",
        "Manage marketplace listings",
        "/my-products",
      ],
      [
        "📦",
        "Inventory",
        "Monitor your available stock",
        "/inventory",
      ],
      [
        "💰",
        "Market Rates",
        "Check government rates",
        "/government-rates",
      ],
      [
        "📋",
        "Orders",
        "View incoming orders",
        "/farmer-orders",
      ],
    ],
    []
  );

  useEffect(() => {
    let mounted = true;

    get("/dashboard/farmer")
      .then((response) => {
        if (!mounted) return;

        setDashboard(response.data);
      })
      .catch((err) => {
        if (!mounted) return;

        setError(
          err?.message || "Unable to load dashboard."
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error) {
    return (
      <div className="amfd-page">
        <div className="amfd-message">
          <div>⚠️</div>

          <h3>Unable to load dashboard</h3>

          <p>{error}</p>

          <button
            className="amfd-btn amfd-btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (!dashboard) {
    return (
      <div className="amfd-page">
        <div className="amfd-message">
          <div>🌱</div>

          <h3>Loading your farm dashboard...</h3>

          <p>
            Getting your latest farm information.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD DATA
  // --------------------------------------------------

  const stats = dashboard?.stats || {};
  const orders = Array.isArray(dashboard?.orders)
    ? dashboard.orders
    : [];

  const totalIncome = Number(
    stats?.totalIncome || 0
  );

  const totalExpenses = Number(
    stats?.totalExpenses || 0
  );

  const totalSales = Number(
    stats?.totalSales || 0
  );

  const netIncome = totalIncome - totalExpenses;

  const activeOrders = orders.filter(
    (order) =>
      String(order?.status || "").toLowerCase() !==
      "cancelled"
  ).length;

  const recentOrders = orders.slice(0, 5);

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="amfd-page">

      {/* ================================================
          HERO
      ================================================= */}

      <section className="amfd-hero">

        <div className="amfd-hero-copy">

          <div className="amfd-kicker">
            🌾 FARMER PORTAL
          </div>

          <h1>
            Grow smarter.
            <br />
            Manage better.
          </h1>

          <p>
            Everything you need to manage your farm,
            crops, inventory and agricultural business
            in one place.
          </p>

          <div className="amfd-actions">

            <Link
              to="/farm-management"
              className="amfd-btn amfd-btn-primary"
            >
              🚜 Manage My Farm
            </Link>

            <Link
              to="/my-products"
              className="amfd-btn amfd-btn-light"
            >
              🛒 View My Products
            </Link>

          </div>

        </div>

        <div className="amfd-hero-art">

          <div className="amfd-sun">
            🌾
          </div>

          <div className="amfd-floating">

            <span>🌱</span>

            <div>
              <strong>
                Farm Overview
              </strong>

              <small>
                Data synced with your account
              </small>
            </div>

            <b>
              ● Live
            </b>

          </div>

        </div>

      </section>


      {/* ================================================
          MAIN CONTENT
      ================================================= */}

      <main className="amfd-content">

        {/* ================================================
            HEADER
        ================================================= */}

        <div className="amfd-heading">

          <div>

            <span>
              YOUR FARM AT A GLANCE
            </span>

            <h2>
              Farm Overview
            </h2>

            <p>
              A quick look at your current
              agricultural activity.
            </p>

          </div>

          <Link
            to="/farmer-profile"
            className="amfd-outline"
          >
            👤 View Profile
          </Link>

        </div>


        {/* ================================================
            STAT CARDS
        ================================================= */}

        <section className="amfd-stats">

          {/* TOTAL FARMS */}

          <article>

            <div className="amfd-stat-icon green">
              🚜
            </div>

            <div>

              <small>
                Total Farms
              </small>

              <strong>
                {stats?.farms || 0}
              </strong>

              <span>
                Registered farms
              </span>

            </div>

          </article>


          {/* TOTAL CROPS */}

          <article>

            <div className="amfd-stat-icon yellow">
              🌱
            </div>

            <div>

              <small>
                Total Crops
              </small>

              <strong>
                {stats?.crops || 0}
              </strong>

              <span>
                Active crop records
              </span>

            </div>

          </article>


          {/* AVAILABLE STOCK */}

          <article>

            <div className="amfd-stat-icon blue">
              📦
            </div>

            <div>

              <small>
                Available Stock
              </small>

              <strong>
                {stats?.availableStock || 0}
              </strong>

              <span>
                Units available
              </span>

            </div>

          </article>


          {/* TOTAL SALES */}

          <article>

            <div className="amfd-stat-icon orange">
              💰
            </div>

            <div>

              <small>
                Total Sales
              </small>

              <strong>
                ₹{totalSales.toLocaleString("en-IN")}
              </strong>

              <span>
                Order value
              </span>

            </div>

          </article>

        </section>


        {/* ================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="amfd-section">

          <div className="amfd-section-title">

            <span>
              MANAGE YOUR FARM
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>


          <div className="amfd-quick-grid">

            {quickActions.map(
              ([icon, title, text, path]) => (

                <Link
                  className="amfd-quick"
                  to={path}
                  key={title}
                >

                  <div className="amfd-quick-icon">
                    {icon}
                  </div>

                  <div>

                    <h3>
                      {title}
                    </h3>

                    <p>
                      {text}
                    </p>

                  </div>

                  <b>
                    →
                  </b>

                </Link>

              )
            )}

          </div>

        </section>


        {/* ================================================
            FINANCIAL + ORDERS
        ================================================= */}

        <section className="amfd-columns">


          {/* ============================================
              FINANCIAL SUMMARY
          ============================================= */}

          <div className="amfd-panel">

            <div className="amfd-panel-head">

              <div>

                <span>
                  FINANCIAL SUMMARY
                </span>

                <h2>
                  Business Overview
                </h2>

              </div>

              <i>
                💰
              </i>

            </div>


            <div className="amfd-net">

              <small>
                Net Income
              </small>

              <strong
                className={
                  netIncome >= 0
                    ? "positive"
                    : "negative"
                }
              >
                ₹{netIncome.toLocaleString("en-IN")}
              </strong>

            </div>


            <div className="amfd-finance">

              <div>

                <span>
                  Total Income
                </span>

                <strong>
                  ₹{totalIncome.toLocaleString("en-IN")}
                </strong>

              </div>


              <div>

                <span>
                  Total Expenses
                </span>

                <strong>
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </strong>

              </div>

            </div>


            <Link
              to="/income"
              className="amfd-panel-link"
            >
              View financial records →
            </Link>

          </div>


          {/* ============================================
              RECENT ORDERS
          ============================================= */}

          <div className="amfd-panel">

            <div className="amfd-panel-head">

              <div>

                <span>
                  RECENT ACTIVITY
                </span>

                <h2>
                  Recent Orders
                </h2>

              </div>

              <em>
                {activeOrders} active
              </em>

            </div>


            {recentOrders.length > 0 ? (

              <div className="amfd-orders">

                {recentOrders.map((order, index) => {

                  const status =
                    order?.status || "Pending";

                  const orderId =
                    order?._id ||
                    order?.id ||
                    `order-${index}`;

                  const orderNumber =
                    order?.orderNumber ||
                    order?.orderId ||
                    "Order";

                  const orderDate =
                    order?.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "Recent";

                  const orderTotal =
                    Number(
                      order?.total ||
                      order?.amount ||
                      0
                    );

                  return (

                    <div
                      className="amfd-order"
                      key={orderId}
                    >

                      <span className="amfd-order-icon">
                        📦
                      </span>


                      <div>

                        <strong>
                          {orderNumber}
                        </strong>

                        <small>
                          {orderDate}
                        </small>

                      </div>


                      <div className="amfd-order-right">

                        <strong>
                          ₹
                          {orderTotal.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <small>
                          {status}
                        </small>

                      </div>

                    </div>

                  );
                })}

              </div>

            ) : (

              <div className="amfd-empty">

                <div>
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Your incoming marketplace orders
                  will appear here.
                </p>

              </div>

            )}


            <Link
              to="/farmer-orders"
              className="amfd-panel-link"
            >
              View all orders →
            </Link>

          </div>

        </section>


        {/* ================================================
            HARVEST STRIP
        ================================================= */}

        <section className="amfd-strip">

          <div>

            <span>
              🌾
            </span>

            <div>

              <strong>
                Keep your farm records updated
              </strong>

              <p>
                Track crops, harvests, expenses
                and irrigation to keep your
                agricultural operations organised.
              </p>

            </div>

          </div>


          <Link to="/harvest">
            Manage Harvest →
          </Link>

        </section>

      </main>

    </div>
  );
}