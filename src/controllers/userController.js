const { COURSE_FIELDS } = require("../constants/course");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");
const validator = require("validator");

const getCurrentUser = (req, res) => {
  try {
    // `req.user` was attached by verifyToken middleware
    const user = req.user;

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error("Error in /me:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "enrolledCourses.courseId",
      populate: {
        path: "creator",
        select: "name", // limit creator fields
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      enrolledCourses: user.enrolledCourses,
    });
  } catch (err) {
    console.error("Failed to fetch enrolled courses:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prevent enrolling if not published
    if (!course.isPublished) {
      return res.status(403).json({ message: "Course is not published yet" });
    }

    const user = await User.findById(userId);

    const alreadyEnrolled = user.enrolledCourses.some((enrolledCourses) => {
      return enrolledCourses.courseId.equals(courseId);
    });
    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // Optional: If course is paid, validate payment here (e.g., check `req.body.paymentStatus`)

    user.enrolledCourses.push({
      courseId,
      progress: 0,
    });

    await user.save();

    res.status(200).json({ message: "Successfully enrolled in the course" });
  } catch (err) {
    console.error("Enrollment failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProgress = async (req, res) => {
  const user = req.user;
  const courseId = req.params.id;
  const videoKey = req.query.videoKey;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  // Find course to get total number of videos
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const totalVideos = course.videos.length;
  if (totalVideos === 0) {
    return res.status(400).json({ message: "Course has no videos" });
  }

  const courseEntry = user.enrolledCourses.find((course) =>
    course.courseId.equals(courseId)
  );

  if (!courseEntry) {
    return res.status(404).json({
      message: "Course not found in your enrolled list",
    });
  }

  // Check if videoKey already exists
  const alreadyCompleted = courseEntry.completedVideos.some(
    (v) => v.key === videoKey
  );

  if (!alreadyCompleted) {
    // Add to completedVideos
    courseEntry.completedVideos.push({ key: videoKey });
  } else {
    courseEntry.completedVideos.pop({ key: videoKey });
  }

  // Recalculate progress
  const completedCount = courseEntry.completedVideos.length;
  courseEntry.progress = Math.round((completedCount / totalVideos) * 100);

  await user.save();
  res.status(200).json({
    message: "Progress updated succesfully",
    data: { progress: courseEntry.progress, completedVideos:courseEntry.completedVideos},
  });
};

const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Find the user
    const user = await User.findById(userId);

    // Find the enrolled course entry
    const courseEntry = user.enrolledCourses.find((entry) =>
      entry.courseId.equals(courseId)
    );

    if (!courseEntry) {
      return res
        .status(404)
        .json({ message: "Course not found in your enrolled list" });
    }

    // Find course to get total number of videos
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Completed videos from user document
    const completedVideos = courseEntry.completedVideos || [];

    // progress percentage
    let progress = courseEntry.progress || 0;

    res.status(200).json({
      courseId,
      progress, // number: percentage completed
      completedVideos, // array: video keys user completed
    });
  } catch (err) {
    console.error("Failed to get progress:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  getCurrentUser,
  getMyCourses,
  enrollInCourse,
  updateProgress,
  getCourseProgress,
};
