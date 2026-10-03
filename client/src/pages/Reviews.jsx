import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../api";
export default function Reviews() {
  const [reviews, setReviews] = useState([]),
    [form, setForm] = useState({
      product: "",
      productId: "",
      rating: 5,
      comment: "",
    }),
    [products, setProducts] = useState([]),
    [message, setMessage] = useState("");
  const load = async () => {
    try {
      const [r, p] = await Promise.all([get("/reviews"), get("/products")]);
      setReviews(r.data || []);
      setProducts(p.data || []);
    } catch (e) {
      setMessage(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await post("/reviews", form);
      setMessage(r.message);
      setForm({ product: "", productId: "", rating: 5, comment: "" });
      load();
    } catch (e) {
      setMessage(e.message);
    }
  };
  return (
    <div className="buyer-page">
      <div className="buyer-page-top">
        <div>
          <span>BUYER FEEDBACK</span>
          <h1>⭐ Reviews & Ratings</h1>
          <p>Reviews are stored in MongoDB and linked to products.</p>
        </div>
        <div className="buyer-actions">
          <Link to="/buyer-orders">Orders</Link>
          <Link to="/buyer-dashboard">Marketplace</Link>
        </div>
      </div>
      {message && <div className="save-message">{message}</div>}
      <div className="review-layout">
        <form className="review-form" onSubmit={submit}>
          <h2>Write a Review</h2>
          <label>
            Product
            <select
              required
              value={form.productId}
              onChange={(e) => {
                const p = products.find((x) => x._id === e.target.value);
                setForm({
                  ...form,
                  productId: e.target.value,
                  product: p?.name || "",
                });
              }}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rating
            <select
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Your Review
            <textarea
              rows="5"
              required
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </label>
          <button className="buyer-primary">Submit Review</button>
        </form>
        <section className="review-list">
          <h2>Your Reviews</h2>
          {reviews.length === 0 ? (
            <div className="buyer-empty compact">
              <div>⭐</div>
              <h3>No reviews yet</h3>
            </div>
          ) : (
            reviews.map((r) => (
              <article className="review-card" key={r._id}>
                <div>
                  <strong>{r.product}</strong>
                  <span>
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <small>
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </small>
                <p>{r.comment}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
