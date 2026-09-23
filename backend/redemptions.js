const Redemption = require("./models/Redemption");

async function createRedemption({
  address,
  rewardId,
  rewardName,
  pointsCost,
  code,
  txHash,
  discountType,
  discountValue,
  minOrder,
}) {
  const count = await Redemption.countDocuments();
  const redemptionId = `RDM-${String(count + 1).padStart(5, "0")}`;

  const r = await Redemption.create({
    redemptionId,
    address: address.toLowerCase(),
    rewardId,
    rewardName,
    pointsCost,
    code,
    txHash,
    discountType: discountType || "flat",
    discountValue: discountValue || 0,
    minOrder: minOrder || 0,
  });

  return formatRedemption(r);
}

function formatRedemption(r) {
  return {
    id: r.redemptionId,
    address: r.address,
    rewardId: r.rewardId,
    rewardName: r.rewardName,
    pointsCost: r.pointsCost,
    code: r.code,
    txHash: r.txHash,
    discountType: r.discountType,
    discountValue: r.discountValue,
    minOrder: r.minOrder,
    used: r.used,
    usedAt: r.usedAt ? r.usedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  };
}

async function getRedemptionsByAddress(address) {
  const redemptions = await Redemption.find({
    address: address.toLowerCase(),
  }).sort({ createdAt: 1 });
  return redemptions.map(formatRedemption);
}

async function findByCode(code) {
  const r = await Redemption.findOne({ code: code.toUpperCase() });
  return r ? formatRedemption(r) : null;
}

async function markUsed(code) {
  const r = await Redemption.findOneAndUpdate(
    { code: code.toUpperCase() },
    { used: true, usedAt: new Date() },
    { new: true }
  );
  return r ? formatRedemption(r) : null;
}

module.exports = {
  createRedemption,
  getRedemptionsByAddress,
  findByCode,
  markUsed,
};