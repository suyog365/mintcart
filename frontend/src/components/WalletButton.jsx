import { useEffect } from "react";
import { Wallet, Loader2, LogOut, Copy, CheckCircle2 } from "lucide-react";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../store/authStore";
import { notify } from "../utils/toast";

export default function WalletButton() {
  const address = useWallet((s) => s.address);
  const connecting = useWallet((s) => s.connecting);
  const connect = useWallet((s) => s.connect);
  const disconnect = useWallet((s) => s.disconnect);
  const refresh = useWallet((s) => s.refresh);
  const hasMetaMask = useWallet((s) => s.hasMetaMask);
  const setWalletOnUser = useAuth((s) => s.setWallet);

  // Listen for account / chain changes from MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
        notify.error("Wallet disconnected");
      } else {
        refresh();
        notify.success("Wallet changed");
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnect() {
    if (!hasMetaMask()) {
      notify.error("MetaMask is not installed");
      window.open("https://metamask.io/download", "_blank");
      return;
    }
    try {
      const addr = await connect();
      // Save wallet address to the logged-in user's account
      if (addr) await setWalletOnUser(addr);
      notify.success("Wallet connected! 🎉");
    } catch (err) {
      if (err.code === 4001) {
        notify.error("Connection rejected");
      } else {
        notify.error(err.message || "Failed to connect");
      }
    }
  }

  function handleDisconnect() {
    disconnect();
    notify.info("Wallet disconnected");
  }

  function copyAddress() {
    navigator.clipboard.writeText(address);
    notify.success("Address copied");
  }

  function shortAddr(a) {
    return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
  }

  // ---------- NOT CONNECTED ----------
  if (!address) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition disabled:opacity-50"
      >
        {connecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {connecting ? "Connecting..." : "Connect Wallet"}
        </span>
      </button>
    );
  }

  // ---------- CONNECTED ----------
  return (
    <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-2 sm:px-3 py-1.5">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
      <span className="font-mono text-xs sm:text-sm text-green-700 dark:text-green-300">
        {shortAddr(address)}
      </span>
      <button
        onClick={copyAddress}
        className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition"
        aria-label="Copy address"
      >
        <Copy className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
      </button>
      <button
        onClick={handleDisconnect}
        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
        aria-label="Disconnect"
      >
        <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
      </button>
    </div>
  );
}