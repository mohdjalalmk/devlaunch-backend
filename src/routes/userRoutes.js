const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  getMyCourses,
  enrollInCourse,
  updateProgress,
  getCourseProgress,
} = require("../controllers/userController");
const { userAuth } = require("../middlewares/userAuth");

// GET /api/users/me
router.get("/me", userAuth, getCurrentUser);

router.get("/me/courses", userAuth, getMyCourses);

router.post("/courses/enroll/:id", userAuth, enrollInCourse);

router.patch("/me/courses/:id/", userAuth, updateProgress);

router.get("/me/courses/:id/progress", userAuth, getCourseProgress);

module.exports = router;
