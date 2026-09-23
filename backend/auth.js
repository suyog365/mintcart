const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: sign a JWT
function signToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// Helper: format user for response
function formatUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    walletAddress: user.walletAddress,
    provider: user.provider || "google",
  };
}

// ==================== GOOGLE ====================

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        googleId,
        email: email.toLowerCase(),
        name,
        picture,
        provider: "google",
        lastLogin: new Date(),
      });
      console.log("🆕 New Google user:", email);
    } else {
      // Link Google ID if they signed up with email previously
      if (!user.googleId || user.googleId.startsWith("local_")) {
        user.googleId = googleId;
      }
      user.picture = picture || user.picture;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = signToken(user);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// ==================== EMAIL + PASSWORD ====================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      googleId: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      email: email.toLowerCase(),
      name: name.trim(),
      picture: "",
      password: hashed,
      provider: "local",
      lastLogin: new Date(),
    });

    console.log("🆕 New local user:", email);

    const token = signToken(user);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // IMPORTANT: .select("+password") is required because password has select:false
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ME + WALLET ====================

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.put("/wallet", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: "walletAddress is required" });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );

    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;