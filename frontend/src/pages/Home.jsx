import { products, calculatePoints } from "../data/products";
import { useCart } from "../store/cartStore";
import { notify } from "../utils/toast";
import { Star, ShoppingCart, Sparkles } from "lucide-react";

export default function Home() {
  const addItem = useCart((s) => s.addItem);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Earn on every purchase
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Shop. Earn points. Get rewarded.
        </h1>
        <p className="text-white/80 max-w-xl">
          Every ₹10 you spend earns you 1 loyalty point — stored securely on the
          blockchain, redeemable for discounts anytime.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Our Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
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
              <span className="text-xs text-brand-600 dark:text-brand-500 font-semibold uppercase">
                {p.category}
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-1">
                {p.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {p.rating}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{p.price}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +{calculatePoints(p.price)} pts
                  </div>
                </div>
                <button
                  onClick={() => {
                    addItem(p);
                    notify.cart(p.name);
                  }}
                  className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}