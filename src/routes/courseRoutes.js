const express = require("express");
const router = express.Router();
const { createCourse } = require("../controllers/courseController");
const { userAuth } = require("../middlewares/userAuth");
const { checkAdmin } = require("../middlewares/checkAdmin");
const {
  getCourseById,
  deleteCourse,
  updateCourse,
  getAllCourses,
} = require("../controllers/courseController");
const {
  uploadVideo,
  getSignedVideoUrl,
  deleteVideo
} = require("../controllers/videoController");
const { uploadVideo: upload,uploadImage } = require("../middlewares/upload");
// Admin-only: Create course
router.post("/", userAuth, checkAdmin,  uploadImage.single("thumbnail"), createCourse);

router.get("/", getAllCourses);

router.patch(
  "/:id",
  userAuth,
  checkAdmin,
  uploadImage.single("thumbnail"),
  updateCourse
);

router.get("/:id", userAuth, getCourseById);

router.delete("/:id", userAuth, checkAdmin, deleteCourse);

router.post(
  "/:id/videos",
  userAuth,
  checkAdmin,
  upload.single("file"),
  uploadVideo
);

router.get("/:id/videos/signed-url", userAuth, getSignedVideoUrl);

router.delete(
  "/:id/videos",
  userAuth,
  checkAdmin,
  deleteVideo
);


module.exports = router;
