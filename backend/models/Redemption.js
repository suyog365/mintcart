const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    redemptionId: { type: String, required: true, unique: true },
    address: { type: String, required: true, lowercase: true, index: true },
    rewardId: { type: String, required: true },
    rewardName: { type: String, required: true },
    pointsCost: { type: Number, required: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    txHash: { type: String, required: true },
    discountType: { type: String, default: "flat" },
    discountValue: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Redemption", redemptionSchema);