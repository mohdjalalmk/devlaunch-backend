const express = require('express');
const router = express.Router();
const { loginUser,logoutUser,sendOtp,verifyOtp, deleteUser } = require('../controllers/authController');
const { userAuth } = require("../middlewares/userAuth");

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp',sendOtp)
router.post('/signup/verify-otp',verifyOtp)
router.delete('/delete',userAuth ,deleteUser);



module.exports = router;
