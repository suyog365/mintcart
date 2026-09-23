import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { useTheme } from "./store/themeStore";
import { useSyncUser } from "./hooks/useSyncUser";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const initTheme = useTheme((s) => s.init);

  useSyncUser();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: "system-ui, sans-serif" },
        }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <>
                  <Header onCartClick={() => setCartOpen(true)} />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/rewards" element={<Rewards />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <CartDrawer
                    open={cartOpen}
                    onClose={() => setCartOpen(false)}
                    onCheckout={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                  />
                  <CheckoutModal
                    open={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                  />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}