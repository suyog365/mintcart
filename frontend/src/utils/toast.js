import toast from "react-hot-toast";

// Base styling shared by all toasts
const base = {
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "14px",
  padding: "12px 16px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
};

export const notify = {
  // ==================== SUCCESS ====================
  success: (msg) =>
    toast.success(msg, {
      style: {
        ...base,
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#fff",
      },
      iconTheme: { primary: "#fff", secondary: "#10b981" },
    }),

  // ==================== ERROR ====================
  error: (msg) =>
    toast.error(msg, {
      style: {
        ...base,
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#fff",
      },
      iconTheme: { primary: "#fff", secondary: "#ef4444" },
    }),

  // ==================== INFO ====================
  info: (msg) =>
    toast(msg, {
      icon: "ℹ️",
      style: {
        ...base,
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "#fff",
      },
    }),

  // ==================== POINTS EARNED ====================
  points: (amount) =>
    toast(`+${amount} LPTS earned!`, {
      icon: "🎉",
      style: {
        ...base,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff",
      },
    }),

  // ==================== CART ====================
  cart: (name) =>
    toast(`${name} added`, {
      icon: "🛒",
      style: {
        ...base,
        background: "linear-gradient(135deg, #1f2937, #111827)",
        color: "#fff",
      },
    }),

  // ==================== WALLET ====================
  wallet: (msg) =>
    toast(msg, {
      icon: "👛",
      style: {
        ...base,
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#fff",
      },
    }),

  // ==================== REWARD REDEEMED ====================
  reward: (name) =>
    toast(`${name} redeemed!`, {
      icon: "🎁",
      style: {
        ...base,
        background: "linear-gradient(135deg, #ec4899, #db2777)",
        color: "#fff",
      },
    }),

  // ==================== ORDER PLACED ====================
  order: (orderId, points) =>
    toast(`Order ${orderId} placed · +${points} LPTS`, {
      icon: "📦",
      style: {
        ...base,
        background: "linear-gradient(135deg, #10b981, #0d9488)",
        color: "#fff",
      },
    }),

  // ==================== HISTORY LOADED ====================
  history: (count) =>
    toast.success(`${count} order${count !== 1 ? "s" : ""} loaded`, {
      style: {
        ...base,
        background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        color: "#fff",
      },
      iconTheme: { primary: "#fff", secondary: "#8b5cf6" },
    }),

  // ==================== POINTS LOADED ====================
  pointsLoaded: (balance) =>
    toast.success(`Balance: ${balance} LPTS`, {
      style: {
        ...base,
        background: "linear-gradient(135deg, #14b8a6, #0d9488)",
        color: "#fff",
      },
      iconTheme: { primary: "#fff", secondary: "#14b8a6" },
    }),

  // ==================== DISCOUNT CODE ====================
  codeApplied: (discount) =>
    toast(`−₹${discount} discount applied!`, {
      icon: "🏷️",
      style: {
        ...base,
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "#fff",
      },
    }),

  codeRemoved: () =>
    toast("Discount code removed", {
      icon: "🗑️",
      style: {
        ...base,
        background: "linear-gradient(135deg, #6b7280, #4b5563)",
        color: "#fff",
      },
    }),

  // ==================== LOGOUT ====================
  logout: () =>
    toast("Signed out successfully", {
      icon: "👋",
      style: {
        ...base,
        background: "linear-gradient(135deg, #374151, #1f2937)",
        color: "#fff",
      },
    }),
};