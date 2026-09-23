const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      default: "google",
    },
    walletAddress: {
      type: String,
      default: "",
      lowercase: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);