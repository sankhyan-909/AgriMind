import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { get, put, del } from "../api";
export default function Wishlist() {
  const [items, setItems] = useState([]),
    [cart, setCart] = useState([]),
    [message, setMessage] = useState("");
  const nav = useNavigate();
  const load = async () => {
    try {
      const [w, c] = await Promise.all([
        get("/shop/wishlist"),
        get("/shop/cart"),
      ]);
      setItems(w.data?.products || []);
      setCart(c.data?.items || []);
    } catch (e) {
      setMessage(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    try {
      await del(`/shop/wishlist/${id}`);
      load();
    } catch (e) {
      setMessage(e.message);
    }
  };
  const add = async (p) => {
    try {
      const map = new Map(
        cart.map((i) => [i.product ? i.product._id : i.product, i.quantity]),
      );
      map.set(p._id, Math.min((map.get(p._id) || 0) + 1, p.quantity));
      await put("/shop/cart", {
        items: [...map].map(([productId, quantity]) => ({
          productId,
          quantity,
        })),
      });
      setMessage(`${p.name} added to cart.`);
    } catch (e) {
      setMessage(e.message);
    }
  };
  return (
    <div className="buyer-page">
      <div className="buyer-page-top">
        <div>
          <span>YOUR SAVED PRODUCTS</span>
          <h1>♡ Wishlist</h1>
          <p>Your saved farmer products are stored in MongoDB.</p>
        </div>
        <div className="buyer-actions">
          <Link to="/buyer-dashboard">Marketplace</Link>
          <Link to="/buyer-orders">Orders</Link>
          <Link to="/cart">🛒 Cart</Link>
        </div>
      </div>
      {message && <div className="save-message">✓ {message}</div>}
      {items.length === 0 ? (
        <div className="buyer-empty">
          <div>♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products from the marketplace.</p>
          <Link className="buyer-primary" to="/buyer-dashboard">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((p) => (
            <article className="wishlist-card" key={p._id}>
              <button className="wishlist-remove" onClick={() => remove(p._id)}>
                ×
              </button>
              <div className="product-emoji">{p.emoji || "🌱"}</div>
              <span>{p.category}</span>
              <h3>{p.name}</h3>
              <p>{p.farmer?.name || "Farmer"}</p>
              <strong>
                ₹{p.price} <small>/ {p.unit}</small>
              </strong>
              <div>
                <button onClick={() => nav(`/product/${p._id}`)}>View</button>
                <button onClick={() => add(p)}>Add to Cart</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
