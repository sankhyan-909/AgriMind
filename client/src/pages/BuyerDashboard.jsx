import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  get,
  post,
  put,
  getCurrentUser,
} from "../api";

function BuyerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    getCurrentUser()
  );

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("default");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResponse,
        wishlistResponse,
        cartResponse,
        userResponse,
      ] = await Promise.all([
        get("/products"),
        get("/shop/wishlist"),
        get("/shop/cart"),
        get("/auth/me"),
      ]);

      const mappedProducts =
        (productsResponse.data || []).map(
          (product) => ({
            id: product._id,

            name:
              product.name ||
              "Farm Product",

            category:
              product.category ||
              "Produce",

            price:
              Number(product.price || 0),

            unit:
              product.unit ||
              "kg",

            quantity:
              Number(product.quantity || 0),

            farmer:
              product.farmer?.name ||
              "Local Farmer",

            location:
              product.location ||
              product.farmer?.profile
                ?.location ||
              "India",

            emoji:
              product.emoji ||
              "🌱",

            description:
              product.description ||
              "Fresh farm-grown produce supplied directly by the farmer.",
          })
        );

      setProducts(mappedProducts);

      setWishlist(
        (
          wishlistResponse.data?.products ||
          []
        ).map((item) => item._id)
      );

      setCart(
        (
          cartResponse.data?.items ||
          []
        ).map((item) => ({
          ...item,

          id:
            item.product?._id ||
            item.product,

          name:
            item.product?.name ||
            "Product",

          price:
            Number(
              item.product?.price ||
              0
            ),

          quantity:
            Number(item.quantity || 0),

          availableQuantity:
            Number(
              item.product?.quantity ||
              1
            ),
        }))
      );

      if (userResponse.user) {
        setUser(userResponse.user);

        localStorage.setItem(
          "agrimindCurrentUser",
          JSON.stringify(
            userResponse.user
          )
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load buyer dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      let result =
        products.filter(
          (product) => {
            const query =
              searchTerm
                .trim()
                .toLowerCase();

            if (!query) {
              return (
                category === "All" ||
                product.category ===
                  category
              );
            }

            const searchable = `
              ${product.name}
              ${product.category}
              ${product.farmer}
              ${product.location}
            `.toLowerCase();

            const matchesSearch =
              searchable.includes(query);

            const matchesCategory =
              category === "All" ||
              product.category ===
                category;

            return (
              matchesSearch &&
              matchesCategory
            );
          }
        );

      if (sortBy === "price-low") {
        result = [...result].sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (sortBy === "price-high") {
        result = [...result].sort(
          (a, b) =>
            b.price - a.price
        );
      }

      if (sortBy === "name") {
        result = [...result].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );
      }

      return result;
    }, [
      products,
      searchTerm,
      category,
      sortBy,
    ]);

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );

  const totalCartValue =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );

  const buyerName =
    user?.firstName ||
    user?.name?.split(" ")?.[0] ||
    "Buyer";

  const fullName =
    `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim() ||
    user?.name ||
    "AgriMind Buyer";

  const initials =
    (
      `${user?.firstName || ""}${
        user?.lastName || ""
      }`
    )
      .replace(/\s/g, "")
      .slice(0, 2)
      .toUpperCase() ||
    "BU";

  const addToCart = async (
    product
  ) => {
    try {
      setMessage("");
      setError("");

      if (product.quantity <= 0) {
        setError(
          `${product.name} is out of stock.`
        );
        return;
      }

      const current = new Map(
        cart.map((item) => [
          item.id,
          Number(item.quantity) || 0,
        ])
      );

      const existing =
        current.get(product.id) || 0;

      current.set(
        product.id,
        Math.min(
          existing + 1,
          product.quantity
        )
      );

      const response =
        await put("/shop/cart", {
          items: [
            ...current,
          ].map(
            ([productId, quantity]) => ({
              productId,
              quantity,
            })
          ),
        });

      setCart(
        (
          response.data?.items ||
          []
        ).map((item) => ({
          ...item,

          id:
            item.product?._id ||
            item.product,

          name:
            item.product?.name ||
            "Product",

          price:
            Number(
              item.product?.price ||
                0
            ),

          quantity:
            Number(
              item.quantity || 0
            ),

          availableQuantity:
            Number(
              item.product
                ?.quantity || 1
            ),
        }))
      );

      setMessage(
        `${product.name} added to cart.`
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update cart."
      );
    }
  };

  const toggleWishlist = async (
    productId
  ) => {
    try {
      setMessage("");
      setError("");

      const response =
        await post(
          "/shop/wishlist/toggle",
          {
            productId,
          }
        );

      setWishlist(
        (
          response.data?.products ||
          []
        ).map(
          (product) =>
            product._id
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update wishlist."
      );
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("All");
    setSortBy("default");
  };

  if (loading) {
    return (
      <div className="abd-page">
        <div className="abd-loading">
          <div className="abd-spinner" />

          <h3>
            Loading AgriMind...
          </h3>

          <p>
            Preparing your marketplace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="abd-page">

      {/* =========================
          NAVBAR
      ========================== */}

      <header className="abd-navbar">
        <div className="abd-nav-inner">

          <button
            className="abd-brand"
            onClick={() =>
              navigate(
                "/buyer-dashboard"
              )
            }
          >
            <span className="abd-brand-icon">
              🌱
            </span>

            <span>
              <strong>
                AgriMind
              </strong>

              <small>
                Farm to Buyer
              </small>
            </span>
          </button>

          <nav className="abd-nav-links">
            <button
              className="abd-nav-active"
              onClick={() =>
                navigate(
                  "/buyer-dashboard"
                )
              }
            >
              Marketplace
            </button>

            <button
              onClick={() =>
                navigate(
                  "/buyer-orders"
                )
              }
            >
              Orders
            </button>

            <button
              onClick={() =>
                navigate(
                  "/wishlist"
                )
              }
            >
              Wishlist
              {wishlist.length >
                0 && (
                <span className="abd-nav-badge">
                  {wishlist.length}
                </span>
              )}
            </button>
          </nav>

          <div className="abd-nav-actions">

            <button
              className="abd-cart-btn"
              onClick={() =>
                navigate("/cart")
              }
            >
              🛒

              <span>
                Cart
              </span>

              {cartCount >
                0 && (
                <b>
                  {cartCount}
                </b>
              )}
            </button>

            <button
              className="abd-profile-btn"
              onClick={() =>
                navigate(
                  "/buyer-profile"
                )
              }
            >
              <span className="abd-mini-avatar">
                {initials}
              </span>

              <span>
                <strong>
                  {buyerName}
                </strong>

                <small>
                  My Account
                </small>
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* =========================
          ALERTS
      ========================== */}

      {(message || error) && (
        <div className="abd-alert-wrap">

          {message && (
            <div className="abd-alert abd-success">
              <span>✓</span>
              {message}

              <button
                onClick={() =>
                  setMessage("")
                }
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="abd-alert abd-error">
              <span>!</span>
              {error}

              <button
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>
            </div>
          )}

        </div>
      )}

      {/* =========================
          HERO
      ========================== */}

      <section className="abd-hero">

        <div className="abd-hero-inner">

          <div className="abd-hero-copy">

            <div className="abd-eyebrow">
              🌾 AG R I M I N D
              MARKETPLACE
            </div>

            <h1>
              Fresh from the
              <br />
              farm to{" "}
              <span>you.</span>
            </h1>

            <p>
              Welcome back,{" "}
              <strong>
                {buyerName}
              </strong>
              . Discover fresh,
              farm-grown products
              directly from local
              farmers.
            </p>

            <div className="abd-hero-actions">

              <button
                className="abd-primary-btn"
                onClick={() =>
                  document
                    .getElementById(
                      "abd-marketplace"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              >
                🛍️ Shop Fresh Produce
              </button>

              <button
                className="abd-secondary-btn"
                onClick={() =>
                  navigate(
                    "/buyer-orders"
                  )
                }
              >
                📦 My Orders
              </button>

            </div>

          </div>

          <div className="abd-hero-visual">

            <div className="abd-hero-orbit">
              <span>🥬</span>
              <span>🍅</span>
              <span>🌾</span>
              <span>🥕</span>
            </div>

            <div className="abd-hero-circle">
              🌱
            </div>

            <div className="abd-floating-card">

              <div className="abd-floating-icon">
                🥬
              </div>

              <div>
                <strong>
                  Farm Fresh
                </strong>

                <small>
                  Direct from local farmers
                </small>
              </div>

              <span className="abd-live">
                ● LIVE
              </span>

            </div>

          </div>

        </div>
      </section>

      {/* =========================
          OVERVIEW
      ========================== */}

      <main
        className="abd-main"
        id="abd-marketplace"
      >

        <section className="abd-overview">

          <div className="abd-section-title">

            <div>
              <span>
                YOUR BUYING HUB
              </span>

              <h2>
                Marketplace Overview
              </h2>

              <p>
                Everything you need
                to discover and buy
                fresh farm products.
              </p>
            </div>

            <button
              className="abd-profile-link"
              onClick={() =>
                navigate(
                  "/buyer-profile"
                )
              }
            >
              👤 View Profile
            </button>

          </div>

          <div className="abd-stat-grid">

            <article className="abd-stat-card">

              <div className="abd-stat-icon green">
                🥬
              </div>

              <div>
                <span>
                  Available Products
                </span>

                <strong>
                  {products.length}
                </strong>

                <small>
                  Fresh listings
                </small>
              </div>

            </article>

            <article className="abd-stat-card">

              <div className="abd-stat-icon red">
                ❤️
              </div>

              <div>
                <span>
                  Wishlist
                </span>

                <strong>
                  {wishlist.length}
                </strong>

                <small>
                  Saved products
                </small>
              </div>

            </article>

            <article className="abd-stat-card">

              <div className="abd-stat-icon orange">
                🛒
              </div>

              <div>
                <span>
                  Cart Items
                </span>

                <strong>
                  {cartCount}
                </strong>

                <small>
                  ₹
                  {totalCartValue.toLocaleString(
                    "en-IN"
                  )}{" "}
                  cart value
                </small>
              </div>

            </article>

            <article className="abd-stat-card">

              <div className="abd-stat-icon blue">
                🌾
              </div>

              <div>
                <span>
                  Categories
                </span>

                <strong>
                  {Math.max(
                    categories.length -
                      1,
                    0
                  )}
                </strong>

                <small>
                  Product categories
                </small>
              </div>

            </article>

          </div>

        </section>

        {/* =========================
            MARKETPLACE HEADER
        ========================== */}

        <section className="abd-market-header">

          <div>
            <span className="abd-section-label">
              FARM DIRECT MARKETPLACE
            </span>

            <h2>
              Explore Fresh Produce
            </h2>

            <p>
              Find quality products
              directly from farmers.
            </p>
          </div>

          <div className="abd-result-count">
            <strong>
              {filteredProducts.length}
            </strong>

            <span>
              products available
            </span>
          </div>

        </section>

        {/* =========================
            SEARCH
        ========================== */}

        <section className="abd-search-card">

          <div className="abd-search">

            <span>
              🔍
            </span>

            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search products, farmers, locations..."
            />

            {searchTerm && (
              <button
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="abd-filter-label">
            FILTER
          </div>

          <div className="abd-categories">

            {categories.map(
              (item) => (
                <button
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
                  {item === "All"
                    ? "🌱 All"
                    : item}
                </button>
              )
            )}

          </div>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
            className="abd-sort"
          >
            <option value="default">
              Sort by
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="name">
              Product Name
            </option>
          </select>

        </section>

        {/* =========================
            PRODUCTS
        ========================== */}

        {filteredProducts.length ===
        0 ? (
          <section className="abd-empty">

            <div>
              🔎
            </div>

            <h3>
              No products found
            </h3>

            <p>
              We couldn't find
              anything matching your
              current search or
              filters.
            </p>

            <button
              onClick={
                resetFilters
              }
            >
              Reset Filters
            </button>

          </section>
        ) : (
          <section className="abd-product-grid">

            {filteredProducts.map(
              (product) => {
                const isWishlisted =
                  wishlist.includes(
                    product.id
                  );

                const outOfStock =
                  product.quantity <=
                  0;

                const lowStock =
                  product.quantity > 0 &&
                  product.quantity <= 20;

                return (
                  <article
                    className="abd-product-card"
                    key={product.id}
                  >

                    {/* IMAGE AREA */}

                    <div className="abd-product-visual">

                      <div className="abd-product-emoji">
                        {product.emoji}
                      </div>

                      <span className="abd-category">
                        {product.category}
                      </span>

                      <button
                        className={`abd-wishlist ${
                          isWishlisted
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleWishlist(
                            product.id
                          )
                        }
                        aria-label="Toggle wishlist"
                      >
                        {isWishlisted
                          ? "❤️"
                          : "♡"}
                      </button>

                      {outOfStock && (
                        <span className="abd-stock-overlay">
                          OUT OF STOCK
                        </span>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="abd-product-body">

                      <div className="abd-product-heading">

                        <div>
                          <h3>
                            {product.name}
                          </h3>

                          <span className="abd-product-category">
                            {product.category}
                          </span>
                        </div>

                        <div className="abd-price">
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}

                          <small>
                            /{product.unit}
                          </small>
                        </div>

                      </div>

                      <p className="abd-description">
                        {product.description}
                      </p>

                      <div className="abd-farmer">

                        <div className="abd-farmer-avatar">
                          👨‍🌾
                        </div>

                        <div>
                          <strong>
                            {product.farmer}
                          </strong>

                          <span>
                            📍{" "}
                            {product.location}
                          </span>
                        </div>

                      </div>

                      <div className="abd-product-footer">

                        <span
                          className={
                            outOfStock
                              ? "out"
                              : lowStock
                              ? "low"
                              : "available"
                          }
                        >
                          {outOfStock
                            ? "Out of stock"
                            : lowStock
                            ? `Only ${product.quantity} ${product.unit} left`
                            : `${product.quantity} ${product.unit} available`}
                        </span>

                      </div>

                      <div className="abd-card-actions">

                        <button
                          className="abd-view-btn"
                          onClick={() =>
                            navigate(
                              `/product/${product.id}`
                            )
                          }
                        >
                          View Details
                        </button>

                        <button
                          className="abd-add-btn"
                          disabled={
                            outOfStock
                          }
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                        >
                          🛒 Add to Cart
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

      </main>

      {/* =========================
          QUICK FOOTER
      ========================== */}

      <section className="abd-bottom-strip">

        <div>
          <span>
            🌾
          </span>

          <div>
            <strong>
              Supporting Local Farmers
            </strong>

            <p>
              Every purchase connects
              you directly with the
              people who grow your food.
            </p>
          </div>
        </div>

        <div className="abd-bottom-actions">

          <button
            onClick={() =>
              navigate("/wishlist")
            }
          >
            ❤️ Wishlist
          </button>

          <button
            onClick={() =>
              navigate("/cart")
            }
          >
            🛒 View Cart
          </button>

          <button
            onClick={() =>
              navigate(
                "/buyer-orders"
              )
            }
          >
            📦 My Orders
          </button>

        </div>

      </section>

    </div>
  );
}

export default BuyerDashboard;