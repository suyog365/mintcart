import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import {
  Gift,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Sparkles,
  ShieldCheck,
  Coins,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../store/authStore";
import { notify } from "../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const signup = useAuth((s) => s.signup);
  const login = useAuth((s) => s.login);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const loading = useAuth((s) => s.loading);

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        if (!name || !email || !password) {
          setError("All fields are required");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        await signup({ name, email, password });
        notify.success("Account created! Welcome 🎉");
      } else {
        if (!email || !password) {
          setError("Email and password are required");
          return;
        }
        await login({ email, password });
        notify.success("Welcome back! 👋");
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      await loginWithGoogle(credentialResponse.credential);
      notify.success("Signed in with Google! 🎉");
      navigate("/");
    } catch (err) {
      notify.error(err.message || "Google sign-in failed");
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 via-purple-600 to-brand-700 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* LEFT: Brand panel */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-purple-700 text-white p-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">MintCart</span>
            </div>
            <p className="text-white/70 text-sm">
              Blockchain-Powered Loyalty Store
            </p>
          </div>

          <div className="space-y-6 my-8">
            <h2 className="text-4xl font-bold leading-tight">
              Shop.
              <br />
              Earn points.
              <br />
              Get rewarded.
            </h2>
            <p className="text-white/80">
              Every purchase earns you LPTS tokens minted on-chain, redeemable
              for real discounts.
            </p>

            <div className="space-y-3 pt-4">
              <Feature icon={Coins} text="Earn LPTS on every purchase" />
              <Feature icon={Sparkles} text="Redeem for discounts & rewards" />
              <Feature icon={ShieldCheck} text="Secured by blockchain" />
            </div>
          </div>

          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} MintCart. All rights reserved.
          </p>
        </div>

        {/* RIGHT: Auth form */}
        <div className="bg-white dark:bg-gray-900 p-8 md:p-10 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MintCart
            </span>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {mode === "login" ? "Welcome back 👋" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {mode === "login"
              ? "Sign in to continue shopping and earning rewards"
              : "Join MintCart and start earning points on every order"}
          </p>

          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => notify.error("Google sign-in failed")}
              size="large"
              shape="rectangular"
              width="100%"
              text={mode === "login" ? "signin_with" : "signup_with"}
            />
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <InputField
                icon={UserIcon}
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <InputField
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            {mode === "login" ? (
              <>
                New to MintCart?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 outline-none transition"
      />
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-white/90 text-sm">{text}</span>
    </div>
  );
}