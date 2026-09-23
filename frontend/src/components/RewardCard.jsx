import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function RewardCard({ reward, userPoints, onRedeem, busy }) {
  const canAfford = userPoints >= reward.pointsCost;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="aspect-[3/2] bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center">
        <span className="text-6xl">{reward.icon}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900">{reward.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-brand-600">
              {reward.pointsCost} LPTS
            </span>
          </div>
          <button
            onClick={() => onRedeem(reward)}
            disabled={!canAfford || busy}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              canAfford
                ? "bg-brand-600 hover:bg-brand-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {busy ? "..." : canAfford ? "Redeem" : "Not enough"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}