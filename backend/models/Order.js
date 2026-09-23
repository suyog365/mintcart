const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    address: { type: String, required: true, lowercase: true, index: true },
    items: [
      {
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    originalTotal: Number,
    discount: { type: Number, default: 0 },
    appliedCode: { type: String, default: null },
    pointsEarned: { type: Number, required: true },
    txHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);