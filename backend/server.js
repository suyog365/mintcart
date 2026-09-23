const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const { awardPoints, getPoints, redeemPointsForUser } = require("./blockchain");
const { createOrder, getOrdersByAddress } = require("./orders");
const {
  createRedemption,
  getRedemptionsByAddress,
  findByCode,
  markUsed,
} = require("./redemptions");
const authRoutes = require("./auth");
const requireAdmin = require("./adminMiddleware");
const { getFullAnalytics } = require("./analytics");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const POINTS_PER_RUPEE = 0.1;

app.get("/", (req, res) => {
  res.send("Loyalty Backend is running!");
});

// ==================== POINTS ====================

app.get("/points/:address", async (req, res) => {
  try {
    const balance = await getPoints(req.params.address);
    res.json({ address: req.params.address, points: balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/award", async (req, res) => {
  try {
    const { address, amount } = req.body;
    if (!address || !amount) {
      return res.status(400).json({ error: "address and amount required" });
    }
    const receipt = await awardPoints(address, amount);
    res.json({ success: true, txHash: receipt.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DISCOUNT CODES ====================

app.post("/validate-code", async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: "code is required" });

    const redemption = await findByCode(code);
    if (!redemption) return res.status(404).json({ error: "Invalid code" });
    if (redemption.used)
      return res.status(400).json({ error: "This code has already been used" });
    if (cartTotal < redemption.minOrder) {
      return res.status(400).json({
        error: `Minimum order ₹${redemption.minOrder} required for this code`,
      });
    }

    let discount = 0;
    if (redemption.discountType === "flat") discount = redemption.discountValue;
    else if (redemption.discountType === "percent")
      discount = Math.floor((cartTotal * redemption.discountValue) / 100);
    else if (redemption.discountType === "shipping")
      discount = redemption.discountValue;

    if (discount > cartTotal) discount = cartTotal;

    res.json({
      success: true,
      code: redemption.code,
      discountType: redemption.discountType,
      discountValue: redemption.discountValue,
      discount,
      minOrder: redemption.minOrder,
      rewardName: redemption.rewardName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ORDERS ====================

app.post("/order", async (req, res) => {
  try {
    const { address, items, total, discountCode } = req.body;
    if (!address || !items || !total) {
      return res
        .status(400)
        .json({ error: "address, items, and total are required" });
    }

    let finalTotal = total;
    let discount = 0;
    let appliedCode = null;

    if (discountCode) {
      const redemption = await findByCode(discountCode);
      if (!redemption)
        return res.status(400).json({ error: "Invalid discount code" });
      if (redemption.used)
        return res
          .status(400)
          .json({ error: "This code has already been used" });
      if (total < redemption.minOrder)
        return res
          .status(400)
          .json({ error: `Minimum order ₹${redemption.minOrder} required` });

      if (redemption.discountType === "flat")
        discount = redemption.discountValue;
      else if (redemption.discountType === "percent")
        discount = Math.floor((total * redemption.discountValue) / 100);
      else if (redemption.discountType === "shipping")
        discount = redemption.discountValue;

      if (discount > total) discount = total;
      finalTotal = total - discount;
      appliedCode = redemption.code;
      await markUsed(redemption.code);
    }

    const pointsEarned = Math.floor(finalTotal * POINTS_PER_RUPEE);
    if (pointsEarned <= 0)
      return res
        .status(400)
        .json({ error: "Order total too small to earn points" });

    const receipt = await awardPoints(address, pointsEarned);
    const order = await createOrder({
      address,
      items,
      total: finalTotal,
      originalTotal: total,
      discount,
      appliedCode,
      pointsEarned,
      txHash: receipt.hash,
    });
    const newBalance = await getPoints(address);
    res.json({ success: true, order, newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/orders/:address", async (req, res) => {
  try {
    const orders = await getOrdersByAddress(req.params.address);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== REDEEM ====================

app.post("/redeem", async (req, res) => {
  try {
    const {
      address,
      rewardId,
      rewardName,
      pointsCost,
      discountType,
      discountValue,
      minOrder,
    } = req.body;
    if (!address || !rewardId || !pointsCost) {
      return res
        .status(400)
        .json({ error: "address, rewardId, pointsCost required" });
    }

    const receipt = await redeemPointsForUser(address, pointsCost);
    const code = "SHOP" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const redemption = await createRedemption({
      address,
      rewardId,
      rewardName,
      pointsCost,
      code,
      txHash: receipt.hash,
      discountType,
      discountValue,
      minOrder,
    });

    const newBalance = await getPoints(address);
    res.json({ success: true, redemption, newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/redemptions/:address", async (req, res) => {
  try {
    const redemptions = await getRedemptionsByAddress(req.params.address);
    res.json({ redemptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== HISTORY ====================

app.get("/history/:address", async (req, res) => {
  try {
    const addr = req.params.address;
    const orders = await getOrdersByAddress(addr);
    const redemptions = await getRedemptionsByAddress(addr);
    res.json({ orders, redemptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ANALYTICS (ADMIN ONLY) ====================

app.get("/api/analytics", requireAdmin, async (req, res) => {
  try {
    const data = await getFullAnalytics();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== START ====================

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});