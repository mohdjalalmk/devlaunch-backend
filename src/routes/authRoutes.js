const express = require('express');
const router = express.Router();
const { loginUser,logoutUser,sendOtp,verifyOtp } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp',sendOtp)
router.post('/signup/verify-otp',verifyOtp)


module.exports = router;
