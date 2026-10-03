import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession } from "../api";

function FarmerLayout() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: "📊",
      path: "/farmer-dashboard",
    },
    {
      name: "My Farm",
      icon: "🌱",
      path: "/farm-management",
    },
    {
      name: "Crops",
      icon: "🌾",
      path: "/crop-management",
    },
    {
      name: "My Products",
      icon: "🛒",
      path: "/my-products",
    },
    {
      name: "Inventory",
      icon: "📦",
      path: "/inventory",
    },
    {
      name: "Market Rates",
      icon: "💰",
      path: "/government-rates",
    },
    {
      name: "Orders",
      icon: "📋",
      path: "/farmer-orders",
    },
    { name: "Expenses", icon: "💸", path: "/expenses" },
    { name: "Income", icon: "📈", path: "/income" },
    { name: "Harvest", icon: "🌾", path: "/harvest" },
    { name: "Fertilizer", icon: "🧪", path: "/fertilizer" },
    { name: "Irrigation", icon: "💧", path: "/irrigation" },
    {
      name: "Profile",
      icon: "👤",
      path: "/farmer-profile",
    },
  ];

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="farmer-layout">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .farmer-layout {
          min-height: 100vh;
          display: flex;
          background: #f6f8f7;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2937;
        }

        /* =========================
           SIDEBAR
           ========================= */

        .farmer-layout-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #123d2a;
          color: white;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .farmer-layout-logo {
          padding: 25px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
        }

        .farmer-layout-logo a {
          text-decoration: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .farmer-layout-logo-icon {
          font-size: 29px;
        }

        .farmer-layout-logo-text {
          font-size: 24px;
          font-weight: 800;
        }

        /* =========================
           PROFILE
           ========================= */

        .farmer-layout-profile {
          padding: 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
        }

        .farmer-layout-profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .farmer-layout-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #e8f5ed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .farmer-layout-profile-info strong {
          display: block;
          font-size: 14px;
          color: white;
        }

        .farmer-layout-profile-info p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #a9c5b5;
        }

        /* =========================
           MENU
           ========================= */

        .farmer-layout-menu {
          padding: 18px 12px;
          flex: 1;
          overflow-y: auto;
        }

        .farmer-layout-menu-title {
          margin: 0 10px 10px;
          color: #7fa995;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .farmer-layout-menu a {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 13px;
          margin-bottom: 5px;
          border-radius: 8px;
          text-decoration: none;
          color: #d6e5dc;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .farmer-layout-menu a:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .farmer-layout-menu a.active {
          background: #2f8f57;
          color: white;
        }

        .farmer-layout-menu-icon {
          width: 25px;
          text-align: center;
          font-size: 17px;
        }

        /* =========================
           LOGOUT
           ========================= */

        .farmer-layout-logout {
          padding: 15px 12px;
          border-top: 1px solid rgba(255,255,255,0.10);
        }

        .farmer-layout-logout button {
          width: 100%;
          border: none;
          background: transparent;
          color: #d6e5dc;
          padding: 12px 13px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
        }

        .farmer-layout-logout button:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        /* =========================
           MAIN CONTENT
           ========================= */

        .farmer-layout-main {
          margin-left: 250px;
          width: calc(100% - 250px);
          min-height: 100vh;
        }

        .farmer-layout-topbar {
          height: 72px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .farmer-layout-topbar-left h1 {
          margin: 0;
          font-size: 20px;
          color: #111827;
        }

        .farmer-layout-topbar-left p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #6b7280;
        }

        .farmer-layout-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .farmer-layout-status {
          background: #ecfdf5;
          color: #15803d;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .farmer-layout-content {
          min-height: calc(100vh - 72px);
        }

        /* =========================
           MOBILE
           ========================= */

        @media (max-width: 900px) {

          .farmer-layout-sidebar {
            width: 210px;
          }

          .farmer-layout-main {
            margin-left: 210px;
            width: calc(100% - 210px);
          }

          .farmer-layout-logo-text {
            font-size: 20px;
          }

          .farmer-layout-menu a {
            font-size: 13px;
          }

        }

        @media (max-width: 650px) {

          .farmer-layout-sidebar {
            width: 72px;
          }

          .farmer-layout-logo {
            padding: 20px 10px;
          }

          .farmer-layout-logo a {
            justify-content: center;
          }

          .farmer-layout-logo-text {
            display: none;
          }

          .farmer-layout-profile {
            padding: 15px 10px;
          }

          .farmer-layout-profile-card {
            justify-content: center;
          }

          .farmer-layout-profile-info {
            display: none;
          }

          .farmer-layout-menu-title {
            display: none;
          }

          .farmer-layout-menu {
            padding: 15px 8px;
          }

          .farmer-layout-menu a {
            justify-content: center;
            padding: 13px 8px;
          }

          .farmer-layout-menu a span:last-child {
            display: none;
          }

          .farmer-layout-menu-icon {
            font-size: 19px;
          }

          .farmer-layout-logout {
            padding: 12px 8px;
          }

          .farmer-layout-logout button {
            justify-content: center;
          }

          .farmer-layout-logout button span:last-child {
            display: none;
          }

          .farmer-layout-main {
            margin-left: 72px;
            width: calc(100% - 72px);
          }

          .farmer-layout-topbar {
            padding: 0 16px;
          }

          .farmer-layout-topbar-left h1 {
            font-size: 17px;
          }

          .farmer-layout-status {
            display: none;
          }

        }

      `}</style>

      {/* =========================
          SIDEBAR
          ========================= */}

      <aside className="farmer-layout-sidebar">

        {/* LOGO */}

        <div className="farmer-layout-logo">
          <a href="/">
            <span className="farmer-layout-logo-icon">
              🌾
            </span>

            <span className="farmer-layout-logo-text">
              AgriMind
            </span>
          </a>
        </div>


        {/* PROFILE */}

        <div className="farmer-layout-profile">

          <div className="farmer-layout-profile-card">

            <div className="farmer-layout-avatar">
              👨‍🌾
            </div>

            <div className="farmer-layout-profile-info">
              <strong>
                Farmer
              </strong>

              <p>
                Farm Owner
              </p>
            </div>

          </div>

        </div>


        {/* MENU */}

        <nav className="farmer-layout-menu">

          <p className="farmer-layout-menu-title">
            FARMER PORTAL
          </p>

          {menuItems.map((item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >

              <span className="farmer-layout-menu-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>

            </NavLink>

          ))}

        </nav>


        {/* LOGOUT */}

        <div className="farmer-layout-logout">

          <button onClick={handleLogout}>

            <span>
              🚪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* =========================
          MAIN
          ========================= */}

      <main className="farmer-layout-main">

        <header className="farmer-layout-topbar">

          <div className="farmer-layout-topbar-left">

            <h1>
              AgriMind Farmer Portal
            </h1>

            <p>
              Manage your farm and agricultural activities
            </p>

          </div>

          <div className="farmer-layout-topbar-right">

            <span className="farmer-layout-status">
              ● Farm Active
            </span>

          </div>

        </header>


        <div className="farmer-layout-content">
          <Outlet />
        </div>

      </main>

    </div>
  );}
export default FarmerLayout;