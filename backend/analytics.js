const Order = require("./models/Order");
const Redemption = require("./models/Redemption");
const User = require("./models/User");

async function getSummary() {
  const [revenueAgg, ordersCount, usersCount, pointsAgg] = await Promise.all([
    Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments(),
    User.countDocuments(),
    Order.aggregate([
      { $group: { _id: null, total: { $sum: "$pointsEarned" } } },
    ]),
  ]);

  return {
    totalRevenue: revenueAgg[0]?.total || 0,
    totalOrders: ordersCount,
    totalUsers: usersCount,
    totalPointsIssued: pointsAgg[0]?.total || 0,
  };
}

async function getTopProducts() {
  const result = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
  ]);
  return result.map((r) => ({
    name: r._id,
    quantity: r.quantity,
    revenue: r.revenue,
  }));
}

async function getTopBuyers() {
  const result = await Order.aggregate([
    {
      $group: {
        _id: "$address",
        totalSpent: { $sum: "$total" },
        pointsEarned: { $sum: "$pointsEarned" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { pointsEarned: -1 } },
    { $limit: 5 },
  ]);
  return result.map((r) => ({
    address: r._id,
    totalSpent: r.totalSpent,
    pointsEarned: r.pointsEarned,
    orders: r.orders,
  }));
}

async function getTopRewards() {
  const result = await Redemption.aggregate([
    {
      $group: {
        _id: "$rewardName",
        redemptions: { $sum: 1 },
        pointsBurned: { $sum: "$pointsCost" },
      },
    },
    { $sort: { redemptions: -1 } },
    { $limit: 5 },
  ]);
  return result.map((r) => ({
    name: r._id,
    redemptions: r.redemptions,
    pointsBurned: r.pointsBurned,
  }));
}

async function getRecentActivity(limit = 10) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const redemptions = await Redemption.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const combined = [
    ...orders.map((o) => ({
      type: "order",
      label: `Order ${o.orderId}`,
      detail: `₹${o.total} · +${o.pointsEarned} LPTS`,
      address: o.address,
      at: o.createdAt,
    })),
    ...redemptions.map((r) => ({
      type: "redemption",
      label: `${r.rewardName}`,
      detail: `−${r.pointsCost} LPTS · ${r.code}`,
      address: r.address,
      at: r.createdAt,
    })),
  ];

  combined.sort((a, b) => new Date(b.at) - new Date(a.at));
  return combined.slice(0, limit);
}

async function getFullAnalytics() {
  const [summary, topProducts, topBuyers, topRewards, recent] =
    await Promise.all([
      getSummary(),
      getTopProducts(),
      getTopBuyers(),
      getTopRewards(),
      getRecentActivity(),
    ]);

  return { summary, topProducts, topBuyers, topRewards, recent };
}

module.exports = { getFullAnalytics };