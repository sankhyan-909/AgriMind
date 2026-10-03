
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerLayout from "./pages/FarmerLayout";
import FarmManagement from "./pages/FarmManagement";
import CropManagement from "./pages/CropManagement";
import Inventory from "./pages/Inventory";
import MyProducts from "./pages/MyProducts";
import GovernmentRates from "./pages/GovernmentRates";
import FarmerOrders from "./pages/FarmerOrders";

import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Harvest from "./pages/Harvest";
import Fertilizer from "./pages/Fertilizer";
import Irrigation from "./pages/Irrigation";

import BuyerDashboard from "./pages/BuyerDashboard";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import BuyerOrders from "./pages/BuyerOrders";
import BuyerProfile from "./pages/BuyerProfile";

import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC PAGES
            ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            FARMER PROTECTED ROUTES
            ===================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRole="farmer"
            />
          }
        >

          <Route
            element={<FarmerLayout />}
          >

            {/* Dashboard */}

            <Route
              path="/farmer-dashboard"
              element={<FarmerDashboard />}
            />


            {/* Farm Management */}

            <Route
              path="/farm-management"
              element={<FarmManagement />}
            />


            {/* Crop Management */}

            <Route
              path="/crop-management"
              element={<CropManagement />}
            />


            {/* Inventory */}

            <Route
              path="/inventory"
              element={<Inventory />}
            />


            {/* My Products */}

            <Route
              path="/my-products"
              element={<MyProducts />}
            />


            {/* Government Rates */}

            <Route
              path="/government-rates"
              element={<GovernmentRates />}
            />


            {/* Farmer Orders */}

            <Route
              path="/farmer-orders"
              element={<FarmerOrders />}
            />


            {/* =================================================
                FARMER MANAGEMENT MODULES
                ================================================= */}

            <Route
              path="/expenses"
              element={<Expenses />}
            />

            <Route
              path="/income"
              element={<Income />}
            />

            <Route
              path="/harvest"
              element={<Harvest />}
            />

            <Route
              path="/fertilizer"
              element={<Fertilizer />}
            />

            <Route
              path="/irrigation"
              element={<Irrigation />}
            />


            {/* Farmer Profile */}

            <Route
              path="/farmer-profile"
              element={<Profile />}
            />

          </Route>

        </Route>


        {/* =====================================================
            BUYER PROTECTED ROUTES
            ===================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRole="buyer"
            />
          }
        >

          {/* Buyer Dashboard */}

          <Route
            path="/buyer-dashboard"
            element={<BuyerDashboard />}
          />


          {/* Product Details */}

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />


          {/* Cart */}

          <Route
            path="/cart"
            element={<Cart />}
          />


          {/* Checkout */}

          <Route
            path="/checkout"
            element={<Checkout />}
          />


          {/* Buyer Orders */}

          <Route
            path="/buyer-orders"
            element={<BuyerOrders />}
          />


          {/* Buyer Profile */}

          <Route
            path="/buyer-profile"
            element={<BuyerProfile />}
          />


          {/* Reviews */}

          <Route
            path="/reviews"
            element={<Reviews />}
          />


          {/* Wishlist */}

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />


          {/* Notifications */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Route>


        {/* =====================================================
            FALLBACK
            ===================================================== */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;