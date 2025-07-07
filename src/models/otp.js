const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Otp', otpSchema);
