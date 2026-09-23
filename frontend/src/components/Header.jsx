import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Gift,
  Home,
  User,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useCart, selectTotalItems } from "../store/cartStore";
import { useTheme } from "../store/themeStore";
import { useAuth } from "../store/authStore";
import { useWallet } from "../store/walletStore";
import { notify } from "../utils/toast";
import WalletButton from "./WalletButton";

export default function Header({ onCartClick }) {
  const cartCount = useCart(selectTotalItems);
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const disconnectWallet = useWallet((s) => s.disconnect);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-brand-100 text-brand-700 dark:bg-brand-600 dark:text-white"
        : "text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    }`;

  function handleLogout() {
    logout();
    disconnectWallet();
    setMenuOpen(false);
    notify.logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            MintCart
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navClass} end>
            <Home className="w-4 h-4 inline mr-1" />
            Home
          </NavLink>
          <NavLink to="/rewards" className={navClass}>
            <Gift className="w-4 h-4 inline mr-1" />
            Rewards
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            <User className="w-4 h-4 inline mr-1" />
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          <button
            onClick={onCartClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-64 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}