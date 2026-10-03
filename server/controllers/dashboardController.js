const Farm = require("../models/Farm");
const Crop = require("../models/Crop");
const Inventory = require("../models/Inventory");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Harvest = require("../models/Harvest");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function farmerDashboard(req, res) {
  const owner = req.user.id;
  const [farms, crops, inventory, expenses, income, harvests, products, orders] = await Promise.all([
    Farm.find({ owner }).sort({ createdAt: -1 }),
    Crop.find({ owner }).sort({ createdAt: -1 }),
    Inventory.find({ owner }).sort({ createdAt: -1 }),
    Expense.find({ owner }).sort({ createdAt: -1 }),
    Income.find({ owner }).sort({ createdAt: -1 }),
    Harvest.find({ owner }).sort({ createdAt: -1 }),
    Product.find({ farmer: owner }).sort({ createdAt: -1 }),
    Order.find({ $or: [{ farmer: owner }, { "items.farmerId": owner }] }).populate("buyer", "name email phone").sort({ createdAt: -1 })
  ]);
  const totalProduction = crops.reduce((s, x) => s + Number(x.production || 0), 0);
  const availableStock = inventory.reduce((s, x) => s + Math.max(0, Number(x.stored || 0) - Number(x.sold || 0)), 0);
  const totalSales = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + Number(o.total || 0), 0);
  const totalExpenses = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  const totalIncome = income.reduce((s, x) => s + Number(x.amount || 0), 0);
  return res.json({ success: true, data: { farms, crops, inventory, expenses, income, harvests, products, orders, stats: { farms: farms.length, crops: crops.length, totalProduction, availableStock, totalSales, totalExpenses, totalIncome } } });
}

async function buyerDashboard(req, res) {
  const [products, orders] = await Promise.all([
    Product.find({ status: "Active" }).populate("farmer", "name email phone profile").sort({ createdAt: -1 }),
    Order.find({ buyer: req.user.id }).populate("farmer", "name email phone").sort({ createdAt: -1 })
  ]);
  return res.json({ success: true, data: { products, orders } });
}

module.exports = { farmerDashboard, buyerDashboard };
