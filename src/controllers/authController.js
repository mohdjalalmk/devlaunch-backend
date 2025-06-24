const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validateSignUpData");
const { validateLoginData } = require("../utils/validateLoginData");
const { generateToken } = require("../utils/generateToken");
// controllers/authController.js (or similar)
const TokenBlacklist = require('../models/tokenBlacklistModel');
const jwt = require('jsonwebtoken');

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

module.exports = { logoutUser };

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    validateSignUpData(name, email, password);
    // Check if user already exists

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
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



module.exports = { registerUser, loginUser, logoutUser };
