import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ShoppingBag,
  Gift,
  ExternalLink,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../store/authStore";
import { notify } from "../utils/toast";

const API = "http://localhost:5000";

export default function Profile() {
  const authUser = useAuth((s) => s.user);
  const setWalletOnUser = useAuth((s) => s.setWallet);

  const walletAddr = useWallet((s) => s.address);
  const setAddress = useWallet((s) => s.setAddress);

  const [input, setInput] = useState(walletAddr);
  const [points, setLocalPoints] = useState(0);
  const [orders, setOrders] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);

  useEffect(() => {
    const addr = walletAddr || authUser?.walletAddress;
    if (addr) {
      setInput(addr);
      loadHistory(addr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHistory(addr) {
    if (!addr) return;
    setLoading(true);
    setError("");
    try {
      const pointsRes = await fetch(`${API}/points/${addr}`);
      const pointsData = await pointsRes.json();
      if (pointsData.error) throw new Error(pointsData.error);
      setLocalPoints(pointsData.points);

      const histRes = await fetch(`${API}/history/${addr}`);
      const histData = await histRes.json();
      if (histData.error) throw new Error(histData.error);

      const loadedOrders = histData.orders || [];
      const loadedRedemptions = histData.redemptions || [];
      setOrders(loadedOrders);
      setRedemptions(loadedRedemptions);
      setAddress(addr);
      notify.history(loadedOrders.length);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    }
    setLoading(false);
  }

  async function saveWalletToAccount() {
    if (!input) {
      notify.error("Enter a wallet address first");
      return;
    }
    if (!authUser) {
      notify.error("Sign in first");
      return;
    }
    setSavingWallet(true);
    await setWalletOnUser(input);
    setAddress(input);
    await loadHistory(input);
    setSavingWallet(false);
    notify.success("Wallet saved to your account");
  }

  function shortHash(hash) {
    return hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : "";
  }

  const totalEarned = orders.reduce((s, o) => s + (o.pointsEarned || 0), 0);
  const totalSpent = redemptions.reduce((s, r) => s + (r.pointsCost || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Your Activity
          </span>
        </div>
        {authUser ? (
          <div className="flex items-center gap-4 mb-2">
            {authUser.picture ? (
              <img
                src={authUser.picture}
                alt={authUser.name}
                className="w-14 h-14 rounded-full border-2 border-white/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                {authUser.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Hey, {authUser.name?.split(" ")[0] || "there"}!
              </h1>
              <p className="text-white/80 text-sm">{authUser.email}</p>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile</h1>
        )}
        <p className="text-white/80 mt-2">
          See everything you've earned and redeemed on the blockchain.
        </p>
      </div>

      {/* Wallet section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <Wallet className="w-4 h-4" />
          Wallet Address
        </label>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="0x..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 outline-none transition font-mono text-sm"
          />
          <button
            onClick={saveWalletToAccount}
            disabled={savingWallet || loading}
            className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition disabled:opacity-50 flex items-center gap-2 justify-center"
          >
            {savingWallet ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            Save
          </button>
          <button
            onClick={() => loadHistory(input)}
            disabled={loading || !input}
            className="px-6 py-3 rounded-lg bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold transition disabled:opacity-50 flex items-center gap-2 justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Refresh
          </button>
        </div>
        {walletAddr && walletAddr === input.toLowerCase() && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Wallet connected and saved
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Stats */}
      {input && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Current Balance"
            value={`${points} LPTS`}
            accent="brand"
          />
          <StatCard
            label="Lifetime Earned"
            value={`+${totalEarned} LPTS`}
            accent="green"
          />
          <StatCard
            label="Lifetime Redeemed"
            value={`−${totalSpent} LPTS`}
            accent="red"
          />
        </div>
      )}

      {/* Orders */}
      {input && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Order History
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({orders.length})
            </span>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No orders yet. Buy something on the home page!
            </p>
          ) : (
            <div className="space-y-3">
              {orders
                .slice()
                .reverse()
                .map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {o.id}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(o.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {o.items?.length} item
                        {o.items?.length > 1 ? "s" : ""} · ₹{o.total}
                        {o.discount > 0 && (
                          <span className="text-green-600 dark:text-green-400 ml-2">
                            (saved ₹{o.discount})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        +{o.pointsEarned} LPTS
                      </div>
                      {o.txHash && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1 justify-end mt-0.5">
                          {shortHash(o.txHash)}
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Redemptions */}
      {input && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Redemption History
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({redemptions.length})
            </span>
          </div>
          {redemptions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No redemptions yet. Visit the Rewards page to spend points!
            </p>
          ) : (
            <div className="space-y-3">
              {redemptions
                .slice()
                .reverse()
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {r.id}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {r.rewardName}
                      </div>
                      {r.code && (
                        <div className="text-sm text-brand-600 dark:text-brand-500 font-semibold mt-1">
                          Code: <span className="font-mono">{r.code}</span>
                          {r.used && (
                            <span className="text-xs text-gray-400 ml-2">
                              (used)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-red-600 dark:text-red-400">
                        −{r.pointsCost} LPTS
                      </div>
                      {r.txHash && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                          {shortHash(r.txHash)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const colorClasses = {
    brand:
      "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-100 dark:border-brand-800",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800",
  }[accent];

  return (
    <div className={`rounded-2xl border p-5 ${colorClasses}`}>
      <div className="text-xs font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}