import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wallet,
  Loader2,
  CheckCircle2,
  Copy,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useCart, selectTotalPrice } from "../store/cartStore";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../store/authStore";
import { notify } from "../utils/toast";

const API = "http://localhost:5000";

export default function CheckoutModal({ open, onClose }) {
  const items = useCart((s) => s.items);
  const total = useCart(selectTotalPrice);
  const clearCart = useCart((s) => s.clearCart);

  const walletAddr = useWallet((s) => s.address);
  const setPoints = useWallet((s) => s.setPoints);
  const authUser = useAuth((s) => s.user);
  const setWalletOnUser = useAuth((s) => s.setWallet);

  const [address, setLocalAddress] = useState(walletAddr);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const initial = walletAddr || authUser?.walletAddress || "";
      setLocalAddress(initial);
      setCodeInput("");
      setAppliedCode(null);
      setCodeError("");
      setResult(null);
      setError("");
    }
  }, [open, walletAddr, authUser]);

  const discountAmount = appliedCode?.discount || 0;
  const finalTotal = Math.max(0, total - discountAmount);
  const pointsEarned = Math.floor(finalTotal * 0.1);

  async function applyCode() {
    if (!codeInput) return;
    setCodeLoading(true);
    setCodeError("");
    try {
      const res = await fetch(`${API}/validate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput, cartTotal: total }),
      });
      const data = await res.json();
      if (!data.success) {
        setCodeError(data.error || "Invalid code");
        setAppliedCode(null);
        notify.error(data.error || "Invalid code");
      } else {
        setAppliedCode(data);
        notify.codeApplied(data.discount);
      }
    } catch (err) {
      setCodeError(err.message);
      notify.error(err.message);
    }
    setCodeLoading(false);
  }

  function removeCode() {
    setAppliedCode(null);
    setCodeInput("");
    setCodeError("");
    notify.codeRemoved();
  }

  async function placeOrder() {
    if (!address) {
      setError("Please enter your wallet address");
      notify.error("Please enter your wallet address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          total,
          discountCode: appliedCode?.code || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Order failed");
        notify.error(data.error || "Order failed");
        setLoading(false);
        return;
      }

      // Save wallet to user account if signed in
      if (authUser && address && !authUser.walletAddress) {
        await setWalletOnUser(address);
      }

      setPoints(data.newBalance);
      setResult(data.order);
      clearCart();
      setLoading(false);
      notify.order(data.order.id, data.order.pointsEarned);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={reset}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {result ? "Order Confirmed" : "Checkout"}
              </h2>
              <button
                onClick={reset}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {!result && (
                <>
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Wallet className="w-4 h-4" />
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={address}
                      onChange={(e) => setLocalAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 outline-none transition font-mono text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Tag className="w-4 h-4" />
                      Discount Code
                    </label>
                    {!appliedCode ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="SHOPXXXXXX"
                            value={codeInput}
                            onChange={(e) =>
                              setCodeInput(e.target.value.toUpperCase())
                            }
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 outline-none transition font-mono text-sm uppercase"
                          />
                          <button
                            onClick={applyCode}
                            disabled={codeLoading || !codeInput}
                            className="px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-semibold transition disabled:opacity-50"
                          >
                            {codeLoading ? "..." : "Apply"}
                          </button>
                        </div>
                        {codeError && (
                          <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {codeError}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="font-mono text-sm font-semibold text-green-800 dark:text-green-300">
                              {appliedCode.code}
                            </div>
                            <div className="text-xs text-green-700 dark:text-green-400">
                              {appliedCode.rewardName} · −₹
                              {appliedCode.discount}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={removeCode}
                          className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Items
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {items.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{total}
                      </span>
                    </div>
                    {appliedCode && discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="font-medium">
                          −₹{discountAmount}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-700 pt-2 text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>₹{finalTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-semibold">
                      <span>You'll earn</span>
                      <span>+{pointsEarned} LPTS</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </>
              )}

              {result && (
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
                    🎉 Order Placed!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Your points have been minted on the blockchain
                  </p>

                  <div className="mt-5 space-y-3 text-left">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Order ID
                      </div>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {result.id}
                      </div>
                    </div>
                    {result.discount > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="text-xs text-green-700 dark:text-green-400 font-semibold">
                          Discount Applied
                        </div>
                        <div className="font-bold text-green-700 dark:text-green-300">
                          −₹{result.discount} ({result.appliedCode})
                        </div>
                      </div>
                    )}
                    <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3">
                      <div className="text-xs text-brand-700 dark:text-brand-400 font-semibold">
                        Total Paid
                      </div>
                      <div className="font-bold text-brand-700 dark:text-brand-300">
                        ₹{result.total}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="text-xs text-green-700 dark:text-green-400">
                        Points Earned
                      </div>
                      <div className="font-bold text-lg text-green-700 dark:text-green-300">
                        +{result.pointsEarned} LPTS
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        Transaction
                        <Copy className="w-3 h-3" />
                      </div>
                      <div className="font-mono text-xs break-all text-gray-900 dark:text-white">
                        {result.txHash}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-800">
              {!result ? (
                <button
                  onClick={placeOrder}
                  disabled={loading || items.length === 0}
                  className="w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Minting points...
                    </>
                  ) : (
                    <>Place Order — ₹{finalTotal}</>
                  )}
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold transition"
                >
                  Done
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}