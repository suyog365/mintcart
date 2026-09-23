import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  Sparkles,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { products, calculatePoints } from "../data/products";
import { useCart } from "../store/cartStore";
import { notify } from "../utils/toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Product not found
        </h1>
        <Link
          to="/"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  // Related products: same category, exclude current, max 4
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Fallback if no same-category products
  const suggestions =
    related.length > 0
      ? related
      : products.filter((p) => p.id !== product.id).slice(0, 4);

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    notify.cart(`${quantity} × ${product.name}`);
  }

  function handleBuyNow() {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    notify.cart(`${quantity} × ${product.name}`);
    navigate("/");
    // Small delay so the cart drawer / toast shows
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  const subtotal = product.price * quantity;
  const pointsEarned = calculatePoints(subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden aspect-square"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-xs text-brand-600 dark:text-brand-500 font-semibold uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating} · 128 reviews
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ₹{product.price}
            </span>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium mb-1.5 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              +{calculatePoints(product.price)} LPTS
            </span>
          </div>

          {/* Short description */}
          <p className="mt-5 text-gray-600 dark:text-gray-300">
            {product.longDescription}
          </p>

          {/* Stock status */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            {product.inStock ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  In stock — ships within 24 hours
                </span>
              </>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-medium">
                Out of stock
              </span>
            )}
          </div>

          {/* Features */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Features
            </h3>
            <ul className="space-y-2">
              {product.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity + Cart */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-l-lg text-gray-700 dark:text-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-6 py-3 font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-r-lg text-gray-700 dark:text-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart — ₹{subtotal}
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            className="mt-3 w-full px-6 py-3 rounded-lg border-2 border-brand-600 text-brand-600 dark:text-brand-500 dark:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 font-semibold transition"
          >
            Buy Now
          </button>

          {/* Points info */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3">
            You'll earn{" "}
            <strong className="text-brand-700 dark:text-brand-400">
              {pointsEarned} LPTS
            </strong>{" "}
            on this purchase
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-3 gap-3">
            <TrustBadge icon={Truck} label="Free shipping ₹500+" />
            <TrustBadge icon={Shield} label="Secure payment" />
            <TrustBadge icon={RefreshCw} label="30-day returns" />
          </div>
        </motion.div>
      </div>

      {/* Related products */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            You may also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggestions.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{p.price}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      +{calculatePoints(p.price)} pts
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="w-5 h-5 text-brand-600 dark:text-brand-500 mb-1" />
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}