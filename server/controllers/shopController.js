const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

async function getCart(req, res) {
  const cart = await Cart.findOne({ buyer: req.user.id }).populate("items.product");
  return res.json({ success: true, data: cart || { buyer: req.user.id, items: [] } });
}

async function saveCart(req, res) {
  const input = Array.isArray(req.body.items) ? req.body.items : [];
  const items = [];
  for (const row of input) {
    if (!row?.productId) continue;

    const product = await Product.findOne({
      _id: row.productId,
      status: "Active",
    });

    if (!product) continue;

    const requestedQuantity = Number(row.quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      continue;
    }

    const quantity = Math.min(
      requestedQuantity,
      product.quantity
    );

    if (quantity > 0) {
      items.push({
        product: product._id,
        quantity,
      });
    }
  }
  const cart = await Cart.findOneAndUpdate(
    { buyer: req.user.id },
    { buyer: req.user.id, items },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("items.product");
  return res.json({ success: true, message: "Cart updated successfully.", data: cart });
}

async function clearCart(req, res) {
  const cart = await Cart.findOneAndUpdate({ buyer: req.user.id }, { items: [] }, { upsert: true, new: true });
  return res.json({ success: true, data: cart });
}

async function getWishlist(req, res) {
  const wishlist = await Wishlist.findOne({ buyer: req.user.id }).populate("products");
  return res.json({ success: true, data: wishlist || { buyer: req.user.id, products: [] } });
}

async function toggleWishlist(req, res) {
  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  let wishlist = await Wishlist.findOne({ buyer: req.user.id });
  if (!wishlist) wishlist = await Wishlist.create({ buyer: req.user.id, products: [] });
  const id = product._id.toString();
  const exists = wishlist.products.some((p) => p.toString() === id);
  wishlist.products = exists ? wishlist.products.filter((p) => p.toString() !== id) : [...wishlist.products, product._id];
  await wishlist.save();
  await wishlist.populate("products");
  return res.json({ success: true, added: !exists, data: wishlist });
}

async function removeWishlist(req, res) {
  const wishlist = await Wishlist.findOneAndUpdate(
    { buyer: req.user.id },
    { $pull: { products: req.params.id } },
    { new: true, upsert: true }
  ).populate("products");
  return res.json({ success: true, data: wishlist });
}

module.exports = { getCart, saveCart, clearCart, getWishlist, toggleWishlist, removeWishlist };
