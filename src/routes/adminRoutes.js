const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getAllCoursesForAdmin
} = require("../controllers/adminController");
const { userAuth } = require("../middlewares/userAuth");
const { checkAdmin } = require("../middlewares/checkAdmin");

router.get("/stats", userAuth, checkAdmin, getAdminStats);

router.get("/users", userAuth, checkAdmin, getAllUsers);

router.get("/courses", userAuth, checkAdmin, getAllCoursesForAdmin);

module.exports = router;
