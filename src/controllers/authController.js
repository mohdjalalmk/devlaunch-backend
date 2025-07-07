const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validateSignUpData");
const { validateLoginData } = require("../utils/validateLoginData");
const { generateToken } = require("../utils/generateToken");
// controllers/authController.js (or similar)
const TokenBlacklist = require('../models/tokenBlacklistModel');
const jwt = require('jsonwebtoken');
const Otp = require("../models/otp");
const { sendOtpEmail } = require("../utils/sendEmail");

const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    // Get expiration time from token
    const expiresAt = new Date(decoded.exp * 1000); // exp is in seconds

    // Save to blacklist
    await TokenBlacklist.create({ token, expiresAt });

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ message: "Logout failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    validateLoginData(email, password);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Send token in response header (Authorization: Bearer <token>)
    // res.setHeader("Authorization", `Bearer ${token}`);

    res.status(200).json({
      message: "Login successful",
      token, // send token explicitly too
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    validateSignUpData(name, email, password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Delete existing entry
    await Otp.findOneAndDelete({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email: email.toLowerCase().trim(),
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      name: name.trim(),
      password, // ⚠ you could hash here or store temporarily, safer to hash later
    });

    const resp = await sendOtpEmail(email, otp);

    console.log(resp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpEntry = await Otp.findOne({
      email: email.toLowerCase().trim(),
      code: otp,
      expiresAt: { $gt: Date.now() },
    });

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash password now
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(otpEntry.password, salt);

    // Create user
    const user = await User.create({
      name: otpEntry.name,
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    // Clean up OTPs
    await Otp.deleteMany({ email: email.toLowerCase().trim() });

    // Generate JWT token
    const token = generateToken(user._id);

    // Respond with token & user info
    res.status(201).json({
      message: "User registered & logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser, logoutUser, sendOtp, verifyOtp };
