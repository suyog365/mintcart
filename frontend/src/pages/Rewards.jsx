import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wallet, X, CheckCircle2, Copy } from "lucide-react";
import { rewards } from "../data/rewards";
import RewardCard from "../components/RewardCard";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../store/authStore";
import { notify } from "../utils/toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Rewards() {
  const authUser = useAuth((s) => s.user);
  const setWalletOnUser = useAuth((s) => s.setWallet);

  const walletAddr = useWallet((s) => s.address);
  const points = useWallet((s) => s.points);
  const setAddress = useWallet((s) => s.setAddress);
  const setPoints = useWallet((s) => s.setPoints);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyReward, setBusyReward] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const addr = authUser?.walletAddress || walletAddr || "";
    setInput(addr);
    if (addr) {
      loadPoints(addr);
    } else {
      setPoints(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?._id, authUser?.walletAddress]);

  async function loadPoints(addr) {
    if (!addr) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/points/${addr}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        notify.error(data.error);
      } else {
        setAddress(addr);
        setPoints(data.points);
        notify.pointsLoaded(data.points);
      }
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    }
    setLoading(false);
  }

  async function saveWalletAndLoad() {
    if (!input) {
      notify.error("Enter a wallet address first");
      return;
    }
    if (authUser) await setWalletOnUser(input);
    setAddress(input);
    await loadPoints(input);
  }

  async function handleRedeem(reward) {
    if (!input) {
      setError("Please enter your wallet address first.");
      notify.error("Please enter your wallet address first.");
      return;
    }
    setBusyReward(reward.id);
    setError("");
    try {
      const res = await fetch(`${API}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: input,
          rewardId: reward.id,
          rewardName: reward.name,
          pointsCost: reward.pointsCost,
          discountType: reward.discountType,
          discountValue: reward.discountValue,
          minOrder: reward.minOrder,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Redemption failed");
        notify.error(data.error || "Redemption failed");
        setBusyReward(null);
        return;
      }
      setPoints(data.newBalance);
      setResult(data.redemption);
      setBusyReward(null);
      notify.reward(reward.name);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
      setBusyReward(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Rewards Catalog
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Redeem your points
        </h1>
        <p className="text-white/80 max-w-xl">
          Trade your LPTS for discounts, free items, and VIP perks. Points are
          burned on the blockchain when redeemed.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Wallet className="w-4 h-4" />
              Your Wallet Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 outline-none transition font-mono text-sm"
            />
          </div>
          <button
            onClick={saveWalletAndLoad}
            disabled={loading || !input}
            className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Points"}
          </button>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-6 py-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Your Balance
            </div>
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-500">
              {points} <span className="text-sm font-medium">LPTS</span>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Available Rewards
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            userPoints={points}
            onRedeem={handleRedeem}
            busy={busyReward === r.id}
          />
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setResult(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-9 h-9 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  🎉 Reward Redeemed!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {result.rewardName}
                </p>

                <div className="mt-5 space-y-3 text-left">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Redemption ID
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {result.id}
                    </div>
                  </div>
                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3 border border-brand-100 dark:border-brand-800">
                    <div className="text-xs text-brand-700 dark:text-brand-400 font-semibold">
                      Your Discount Code
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-lg font-bold text-brand-700 dark:text-brand-300">
                        {result.code}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(result.code)
                        }
                        className="p-1.5 rounded-md hover:bg-brand-100 dark:hover:bg-brand-900/50"
                      >
                        <Copy className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                      </button>
                    </div>
                    <div className="text-xs text-brand-700 dark:text-brand-400 mt-1">
                      Value: −₹{result.discountValue}
                      {result.discountType === "percent" ? "%" : ""}
                      {result.minOrder > 0 &&
                        ` · Min order ₹${result.minOrder}`}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Points Burned
                    </div>
                    <div className="font-bold text-red-600 dark:text-red-400">
                      −{result.pointsCost} LPTS
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Transaction
                    </div>
                    <div className="font-mono text-xs break-all text-gray-900 dark:text-white">
                      {result.txHash}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full mt-5 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}