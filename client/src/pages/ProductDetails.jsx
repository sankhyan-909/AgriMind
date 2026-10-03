import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { get, post, put } from "../api";
import "../product-details.css";

const getId = (value) => {
  if (!value) return "";
  return typeof value === "string"
    ? value
    : value._id || value.id || "";
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProduct();
    loadBuyerData();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await get(`/products/${id}`);

      setProduct(response?.data || response?.product || null);
    } catch (err) {
      setError(err?.message || "Unable to load this product.");
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerData = async () => {
    try {
      const [cartResponse, wishlistResponse] = await Promise.all([
        get("/shop/cart"),
        get("/shop/wishlist"),
      ]);

      const items = cartResponse?.data?.items || [];
      setCartItems(items);

      const wishlistProducts =
        wishlistResponse?.data?.products || [];

      setIsWishlisted(
        wishlistProducts.some(
          (item) => getId(item) === String(id)
        )
      );
    } catch {
      // Product page can still work if cart/wishlist
      // data is temporarily unavailable.
    }
  };

  const availableQuantity = Math.max(
    0,
    Number(
      product?.quantity ??
        product?.stock ??
        product?.availableQuantity ??
        0
    )
  );

  const isAvailable =
    product?.status !== "Inactive" &&
    product?.status !== "Out of Stock" &&
    availableQuantity > 0;

  const price = Number(product?.price || 0);

  const totalPrice = useMemo(() => {
    return price * quantity;
  }, [price, quantity]);

  const productUnit =
    product?.unit ||
    product?.quantityUnit ||
    "kg";

  const farmerName =
    product?.farmer?.name ||
    product?.farmerName ||
    product?.seller?.name ||
    "AgriMind Farmer";

  const farmerLocation =
    product?.location ||
    product?.farmer?.profile?.location ||
    product?.farmer?.location ||
    "Location not provided";

  const productDescription =
    product?.description ||
    "Fresh farm produce supplied directly by the farmer through the AgriMind marketplace.";

  const productEmoji =
    product?.emoji ||
    product?.icon ||
    "🌱";

  const addToCart = async (buyNow = false) => {
    if (!isAvailable) return;

    try {
      setCartLoading(true);
      setMessage("");
      setError("");

      const cartMap = new Map();

      cartItems.forEach((item) => {
        const productId = getId(item?.product);

        if (productId && Number(item?.quantity) > 0) {
          cartMap.set(
            String(productId),
            Number(item.quantity)
          );
        }
      });

      const existingQuantity =
        cartMap.get(String(id)) || 0;

      const finalQuantity = Math.min(
        existingQuantity + quantity,
        availableQuantity
      );

      cartMap.set(
        String(id),
        finalQuantity
      );

      const response = await put("/shop/cart", {
        items: [...cartMap.entries()].map(
          ([productId, itemQuantity]) => ({
            productId,
            quantity: itemQuantity,
          })
        ),
      });

      setCartItems(
        response?.data?.items ||
          response?.items ||
          []
      );

      if (buyNow) {
        setMessage(
          "Product added to cart. Opening cart..."
        );

        setTimeout(() => {
          navigate("/cart");
        }, 400);
      } else {
        setMessage(
          "Product added to your cart successfully."
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update your cart."
      );
    } finally {
      setCartLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      setMessage("");
      setError("");

      const response = await post(
        "/shop/wishlist/toggle",
        {
          productId: id,
        }
      );

      const added =
        response?.added ??
        response?.data?.added ??
        !isWishlisted;

      setIsWishlisted(Boolean(added));

      setMessage(
        added
          ? "Added to your wishlist."
          : "Removed from your wishlist."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item?.quantity || 0),
    0
  );

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-shell">
          <div className="pd-loading-card">
            <div className="pd-spinner" />

            <h2>
              Loading product...
            </h2>

            <p>
              Fetching fresh product details
              from the AgriMind marketplace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-shell">
          <div className="pd-error-card">
            <div className="pd-error-icon">
              !
            </div>

            <h2>
              Product not found
            </h2>

            <p>
              {error ||
                "This product may have been removed or is no longer available."}
            </p>

            <Link
              to="/buyer-dashboard"
              className="pd-primary-btn"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">

      {/* NAVBAR */}

      <nav className="pd-navbar">
        <div className="pd-nav-inner">

          <Link
            to="/buyer-dashboard"
            className="pd-brand"
          >
            <span className="pd-brand-icon">
              🌾
            </span>

            <span>
              <strong>
                AgriMind
              </strong>

              <small>
                Farm to you
              </small>
            </span>
          </Link>

          <div className="pd-nav-links">

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
              className="pd-cart-link"
            >
              Cart

              {cartCount > 0 && (
                <span className="pd-cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/buyer-profile"
              className="pd-profile-link"
            >
              My Profile
            </Link>

          </div>
        </div>
      </nav>


      {/* MAIN */}

      <main className="pd-main">

        {/* BREADCRUMB */}

        <div className="pd-breadcrumb">

          <Link to="/buyer-dashboard">
            Marketplace
          </Link>

          <span>/</span>

          <span>
            {product.category ||
              "Farm Produce"}
          </span>

          <span>/</span>

          <strong>
            {product.name}
          </strong>

        </div>


        {/* MESSAGES */}

        {message && (
          <div className="pd-alert pd-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="pd-alert pd-danger">
            <span>!</span>
            {error}
          </div>
        )}


        {/* PRODUCT */}

        <section className="pd-product-layout">

          {/* LEFT */}

          <div className="pd-visual-column">

            <div className="pd-image-card">

              <div className="pd-image-glow" />

              <button
                type="button"
                className={`pd-wishlist-btn ${
                  isWishlisted
                    ? "active"
                    : ""
                }`}
                onClick={
                  toggleWishlist
                }
                disabled={
                  wishlistLoading
                }
              >
                {isWishlisted
                  ? "♥"
                  : "♡"}
              </button>


              <span className="pd-fresh-badge">
                <span>
                  ●
                </span>

                Fresh Listing
              </span>


              <div className="pd-product-emoji">
                {productEmoji}
              </div>


              <div className="pd-image-footer">

                <span>
                  Direct from farmer
                </span>

                <span>
                  •
                </span>

                <span>
                  {product.category ||
                    "Farm Produce"}
                </span>

              </div>

            </div>


            {/* TRUST */}

            <div className="pd-trust-row">

              <div>
                <span>
                  🌱
                </span>

                <strong>
                  Farm Fresh
                </strong>

                <small>
                  Direct sourcing
                </small>
              </div>


              <div>
                <span>
                  ✓
                </span>

                <strong>
                  Verified Listing
                </strong>

                <small>
                  AgriMind marketplace
                </small>
              </div>


              <div>
                <span>
                  🚚
                </span>

                <strong>
                  Order Ready
                </strong>

                <small>
                  Subject to availability
                </small>
              </div>

            </div>

          </div>


          {/* RIGHT */}

          <div className="pd-info-column">

            <div className="pd-category-row">

              <span className="pd-category">
                {product.category ||
                  "Farm Produce"}
              </span>


              <span
                className={`pd-stock ${
                  isAvailable
                    ? "in"
                    : "out"
                }`}
              >
                <span>
                  ●
                </span>

                {isAvailable
                  ? "In Stock"
                  : "Out of Stock"}
              </span>

            </div>


            <h1>
              {product.name}
            </h1>


            <p className="pd-subtitle">
              Fresh produce listed
              directly by a local farmer
              through AgriMind.
            </p>


            {/* PRICE */}

            <div className="pd-price-box">

              <div>

                <span className="pd-price">
                  ₹
                  {price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="pd-unit">
                  {" "}
                  / {productUnit}
                </span>

              </div>


              <div className="pd-availability">
                {availableQuantity}{" "}
                {productUnit} available
              </div>

            </div>


            <div className="pd-divider" />


            {/* DESCRIPTION */}

            <div className="pd-section">

              <div className="pd-section-title">
                About this product
              </div>

              <p className="pd-description">
                {productDescription}
              </p>

            </div>


            {/* FARMER */}

            <div className="pd-farmer-card">

              <div className="pd-farmer-avatar">
                👨‍🌾
              </div>

              <div className="pd-farmer-copy">

                <span>
                  SELLER
                </span>

                <strong>
                  {farmerName}
                </strong>

                <p>
                  📍 {farmerLocation}
                </p>

              </div>


              <div className="pd-verified">

                ✓

                <small>
                  Verified
                </small>

              </div>

            </div>


            {/* BUY */}

            {isAvailable ? (
              <div className="pd-buy-panel">

                <div className="pd-buy-label">

                  <span>
                    Quantity
                  </span>

                  <small>
                    Max{" "}
                    {availableQuantity}{" "}
                    {productUnit}
                  </small>

                </div>


                <div className="pd-buy-row">

                  <div className="pd-quantity-control">

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                      disabled={
                        quantity <= 1
                      }
                    >
                      −
                    </button>


                    <strong>
                      {quantity}
                    </strong>


                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.min(
                              availableQuantity,
                              value + 1
                            )
                        )
                      }
                      disabled={
                        quantity >=
                        availableQuantity
                      }
                    >
                      +
                    </button>

                  </div>


                  <div className="pd-selected-total">

                    <small>
                      Total
                    </small>

                    <strong>
                      ₹
                      {totalPrice.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>


                <div className="pd-actions">

                  <button
                    type="button"
                    className="pd-add-btn"
                    onClick={() =>
                      addToCart(false)
                    }
                    disabled={
                      cartLoading
                    }
                  >
                    🛒{" "}
                    {cartLoading
                      ? "Updating..."
                      : "Add to Cart"}
                  </button>


                  <button
                    type="button"
                    className="pd-buy-btn"
                    onClick={() =>
                      addToCart(true)
                    }
                    disabled={
                      cartLoading
                    }
                  >
                    Buy Now →
                  </button>

                </div>

              </div>
            ) : (
              <div className="pd-out-stock">

                <strong>
                  This product is
                  currently unavailable.
                </strong>

                <span>
                  Browse the marketplace
                  for other fresh listings.
                </span>

                <Link to="/buyer-dashboard">
                  Explore Marketplace →
                </Link>

              </div>
            )}

          </div>

        </section>


        {/* BOTTOM INFO */}

        <section className="pd-info-grid">

          <article className="pd-info-card">

            <span className="pd-info-icon">
              📦
            </span>

            <div>

              <strong>
                Availability
              </strong>

              <p>
                {availableQuantity}{" "}
                {productUnit} currently
                listed for purchase.
              </p>

            </div>

          </article>


          <article className="pd-info-card">

            <span className="pd-info-icon">
              📍
            </span>

            <div>

              <strong>
                Farm Location
              </strong>

              <p>
                {farmerLocation}
              </p>

            </div>

          </article>


          <article className="pd-info-card">

            <span className="pd-info-icon">
              💚
            </span>

            <div>

              <strong>
                Why AgriMind?
              </strong>

              <p>
                Connect with farmers
                and source produce
                through one marketplace.
              </p>

            </div>

          </article>

        </section>

      </main>

    </div>
  );
}

export default ProductDetails;