const Order = require("./models/Order");

async function createOrder({
  address,
  items,
  total,
  originalTotal,
  discount,
  appliedCode,
  pointsEarned,
  txHash,
}) {
  const count = await Order.countDocuments();
  const orderId = `ORD-${String(count + 1).padStart(5, "0")}`;

  const order = await Order.create({
    orderId,
    address: address.toLowerCase(),
    items,
    total,
    originalTotal,
    discount,
    appliedCode,
    pointsEarned,
    txHash,
  });

  return formatOrder(order);
}

function formatOrder(o) {
  return {
    id: o.orderId,
    address: o.address,
    items: o.items,
    total: o.total,
    originalTotal: o.originalTotal,
    discount: o.discount,
    appliedCode: o.appliedCode,
    pointsEarned: o.pointsEarned,
    txHash: o.txHash,
    createdAt: o.createdAt.toISOString(),
  };
}

async function getOrdersByAddress(address) {
  const orders = await Order.find({ address: address.toLowerCase() }).sort({
    createdAt: 1,
  });
  return orders.map(formatOrder);
}

async function getAllOrders() {
  const orders = await Order.find().sort({ createdAt: -1 });
  return orders.map(formatOrder);
}

module.exports = { createOrder, getOrdersByAddress, getAllOrders };