const express = require("express");
const router = express.Router();
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

router.get("/", async (req, res) => {
  try {
    const key = process.env.DATA_GOV_IN_API_KEY;
    if (!key) {
      return res.json({ success: true, count: 0, data: [], source: "data.gov.in / AGMARKNET", message: "Add DATA_GOV_IN_API_KEY in server/.env to load official daily mandi rates." });
    }
    const params = new URLSearchParams({ "api-key": key, format: "json", limit: String(Math.min(Number(req.query.limit || 100), 1000)) });
    const filters = { state: req.query.state, commodity: req.query.commodity, district: req.query.district, market: req.query.market, variety: req.query.variety };
    for (const [k, v] of Object.entries(filters)) if (v) params.set(`filters[${k}]`, v);
    const response = await fetch(`https://api.data.gov.in/resource/${RESOURCE_ID}?${params.toString()}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`data.gov.in returned ${response.status}`);
    const payload = await response.json();
    const data = (payload.records || []).map(r => ({
      id: `${r.arrival_date || ""}-${r.market || ""}-${r.commodity || ""}-${Math.random()}`,
      crop: r.commodity || r.Commodity || "",
      commodity: r.commodity || r.Commodity || "",
      state: r.state || r.State || "",
      district: r.district || r.District || "",
      market: r.market || r.Market || "",
      variety: r.variety || r.Variety || "",
      grade: r.grade || r.Grade || "",
      minRate: Number(r.min_price ?? r.min_price ?? r.Min_Price ?? 0),
      maxRate: Number(r.max_price ?? r.Max_Price ?? 0),
      modalRate: Number(r.modal_price ?? r.Modal_Price ?? 0),
      arrivalDate: r.arrival_date || r.Arrival_Date || ""
    }));
    res.json({ success: true, count: data.length, data, source: "Government of India data.gov.in / AGMARKNET", fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Government rates error:", error.message);
    res.status(502).json({ success: false, message: "Unable to fetch the latest government mandi rates right now.", source: "data.gov.in / AGMARKNET" });
  }
});
module.exports = router;
