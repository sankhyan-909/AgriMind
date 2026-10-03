import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { get, put } from "../api";
import "../cart.css";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getProduct = (item) => item?.product || item;

const getStock = (product) =>
  Math.max(
    0,
    Number(
      product?.quantity ??
        product?.stock ??
        product?.availableQuantity ??
        0
    )
  );

const getPrice = (product) =>
  Number(product?.price || 0);

function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await get("/shop/cart");

      setItems(response?.data?.items || response?.items || []);
    } catch (err) {
      setError(err?.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (newItems, productId = "") => {
    try {
      if (productId) {
        setUpdatingId(productId);
      }

      setError("");
      setMessage("");

      const payload = newItems
        .map((item) => {
          const product = getProduct(item);

          return {
            productId: getId(product),
            quantity: Number(item.quantity || 0),
          };
        })
        .filter(
          (item) =>
            item.productId &&
            item.quantity > 0
        );

      const response = await put("/shop/cart", {
        items: payload,
      });

      setItems(
        response?.data?.items ||
          response?.items ||
          []
      );

      setMessage("Cart updated successfully.");
    } catch (err) {
      setError(
        err?.message || "Unable to update your cart."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const changeQuantity = (item, change) => {
    const product = getProduct(item);
    const productId = getId(product);
    const stock = getStock(product);

    const currentQuantity = Number(item.quantity || 1);

    const nextQuantity = Math.min(
      stock,
      Math.max(1, currentQuantity + change)
    );

    if (nextQuantity === currentQuantity) return;

    const nextItems = items.map((cartItem) => {
      if (
        getId(getProduct(cartItem)) ===
        productId
      ) {
        return {
          ...cartItem,
          quantity: nextQuantity,
        };
      }

      return cartItem;
    });

    updateCart(nextItems, productId);
  };

  const removeItem = async (item) => {
    const product = getProduct(item);
    const productId = getId(product);

    try {
      setRemovingId(productId);
      setError("");
      setMessage("");

      const nextItems = items.filter(
        (cartItem) =>
          getId(getProduct(cartItem)) !==
          productId
      );

      await updateCart(nextItems);

      setMessage("Product removed from your cart.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to remove this product."
      );
    } finally {
      setRemovingId("");
    }
  };

  const cartSummary = useMemo(() => {
    let subtotal = 0;
    let totalQuantity = 0;

    items.forEach((item) => {
      const product = getProduct(item);
      const quantity = Number(item.quantity || 0);
      const price = getPrice(product);

      subtotal += price * quantity;
      totalQuantity += quantity;
    });

    return {
      subtotal,
      totalQuantity,
    };
  }, [items]);

  const deliveryCharge =
    cartSummary.subtotal > 0 ? 0 : 0;

  const grandTotal =
    cartSummary.subtotal + deliveryCharge;

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="cart-spinner" />

          <h2>Loading your cart...</h2>

          <p>
            Fetching your selected farm
            products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* NAVBAR */}
      <nav className="cart-navbar">
        <div className="cart-nav-inner">

          <Link
            to="/buyer-dashboard"
            className="cart-brand"
          >
            <span className="cart-brand-icon">
              🌾
            </span>

            <span>
              <strong>AgriMind</strong>
              <small>Farm to you</small>
            </span>
          </Link>

          <div className="cart-nav-links">

            <Link to="/buyer-dashboard">
              Marketplace
            </Link>

            <Link to="/buyer-orders">
              My Orders
            </Link>

            <Link to="/wishlist">
              Wishlist
            </Link>

            <Link
              to="/cart"
              className="cart-active-link"
            >
              Cart
              {cartSummary.totalQuantity > 0 && (
                <span className="cart-count">
                  {cartSummary.totalQuantity}
                </span>
              )}
            </Link>

            <Link to="/buyer-profile">
              My Profile
            </Link>

          </div>

        </div>
      </nav>

      <main className="cart-main">

        {/* HEADER */}
        <div className="cart-header">

          <div>
            <div className="cart-eyebrow">
              YOUR SHOPPING CART
            </div>

            <h1>
              Fresh picks,
              <span> ready to go.</span>
            </h1>

            <p>
              Review your farm-fresh products
              before placing your order.
            </p>
          </div>

          <Link
            to="/buyer-dashboard"
            className="cart-continue-btn"
          >
            ← Continue Shopping
          </Link>

        </div>

        {message && (
          <div className="cart-alert success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="cart-alert danger">
            <span>!</span>
            {error}
          </div>
        )}

        {/* EMPTY CART */}
        {items.length === 0 ? (
          <section className="cart-empty">

            <div className="cart-empty-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Looks like you haven't added
              any farm-fresh products yet.
            </p>

            <Link
              to="/buyer-dashboard"
              className="cart-primary-btn"
            >
              Explore Marketplace →
            </Link>

          </section>
        ) : (
          <section className="cart-layout">

            {/* PRODUCTS */}
            <div className="cart-products">

              <div className="cart-section-heading">

                <div>
                  <h2>
                    Your Products
                  </h2>

                  <span>
                    {items.length}{" "}
                    {items.length === 1
                      ? "product"
                      : "products"}{" "}
                    ·{" "}
                    {cartSummary.totalQuantity}{" "}
                    total units
                  </span>
                </div>

                <span className="cart-fresh-label">
                  🌱 Farm Fresh
                </span>

              </div>

              <div className="cart-product-list">

                {items.map((item) => {
                  const product =
                    getProduct(item);

                  const productId =
                    getId(product);

                  const quantity =
                    Number(item.quantity || 1);

                  const stock =
                    getStock(product);

                  const price =
                    getPrice(product);

                  const unit =
                    product?.unit ||
                    product?.quantityUnit ||
                    "kg";

                  const subtotal =
                    price * quantity;

                  const emoji =
                    product?.emoji ||
                    product?.icon ||
                    "🌱";

                  const farmer =
                    product?.farmer?.name ||
                    product?.farmerName ||
                    product?.seller?.name ||
                    "AgriMind Farmer";

                  return (
                    <article
                      className="cart-product-card"
                      key={productId}
                    >

                      <Link
                        to={`/product/${productId}`}
                        className="cart-product-image"
                      >
                        <span>
                          {emoji}
                        </span>

                        <small>
                          Farm Fresh
                        </small>
                      </Link>

                      <div className="cart-product-info">

                        <div className="cart-product-top">

                          <div>

                            <span className="cart-category">
                              {product?.category ||
                                "Farm Produce"}
                            </span>

                            <Link
                              to={`/product/${productId}`}
                              className="cart-product-name"
                            >
                              {product?.name ||
                                "Farm Product"}
                            </Link>

                            <p className="cart-farmer">
                              👨‍🌾{" "}
                              {farmer}
                            </p>

                          </div>

                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() =>
                              removeItem(item)
                            }
                            disabled={
                              removingId ===
                              productId
                            }
                            title="Remove product"
                          >
                            {removingId ===
                            productId
                              ? "..."
                              : "×"}
                          </button>

                        </div>

                        <div className="cart-product-bottom">

                          <div className="cart-price">

                            <strong>
                              {formatPrice(price)}
                            </strong>

                            <span>
                              / {unit}
                            </span>

                          </div>

                          <div className="cart-quantity">

                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(
                                  item,
                                  -1
                                )
                              }
                              disabled={
                                quantity <= 1 ||
                                updatingId ===
                                  productId
                              }
                            >
                              −
                            </button>

                            <strong>
                              {updatingId ===
                              productId
                                ? "..."
                                : quantity}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(
                                  item,
                                  1
                                )
                              }
                              disabled={
                                quantity >=
                                  stock ||
                                updatingId ===
                                  productId
                              }
                            >
                              +
                            </button>

                          </div>

                          <div className="cart-item-total">
                            <small>
                              Item Total
                            </small>

                            <strong>
                              {formatPrice(
                                subtotal
                              )}
                            </strong>
                          </div>

                        </div>

                        <div className="cart-stock-line">
                          <span>
                            ●
                          </span>

                          {stock > 0
                            ? `${stock} ${unit} available`
                            : "Currently unavailable"}
                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

            </div>

            {/* SUMMARY */}
            <aside className="cart-summary">

              <div className="cart-summary-card">

                <div className="cart-summary-header">
                  <span>ORDER SUMMARY</span>

                  <strong>
                    {cartSummary.totalQuantity}{" "}
                    units
                  </strong>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-row">
                  <span>
                    Products
                  </span>

                  <strong>
                    {formatPrice(
                      cartSummary.subtotal
                    )}
                  </strong>
                </div>

                <div className="cart-summary-row">
                  <span>
                    Delivery
                  </span>

                  <strong className="free">
                    FREE
                  </strong>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-total-row">
                  <div>
                    <span>
                      Total
                    </span>

                    <small>
                      Inclusive of listed
                      product prices
                    </small>
                  </div>

                  <strong>
                    {formatPrice(
                      grandTotal
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={() =>
                    navigate("/checkout")
                  }
                >
                  Proceed to Checkout
                  <span>→</span>
                </button>

                <div className="cart-safe-note">
                  <span>🔒</span>
                  Secure checkout through
                  AgriMind
                </div>

              </div>

              <div className="cart-benefits">

                <div>
                  <span>🌱</span>

                  <div>
                    <strong>
                      Farm Direct
                    </strong>

                    <small>
                      Source directly from
                      farmers.
                    </small>
                  </div>
                </div>

                <div>
                  <span>✓</span>

                  <div>
                    <strong>
                      Verified Listings
                    </strong>

                    <small>
                      Products listed on
                      AgriMind.
                    </small>
                  </div>
                </div>

                <div>
                  <span>🚚</span>

                  <div>
                    <strong>
                      Order Tracking
                    </strong>

                    <small>
                      Track your order after
                      checkout.
                    </small>
                  </div>
                </div>

              </div>

            </aside>

          </section>
        )}

      </main>
    </div>
  );
}

export default Cart;