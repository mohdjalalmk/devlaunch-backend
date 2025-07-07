const Course = require("../models/courseModel");
const User = require("../models/userModel");

const getAdminStats = async (req, res) => {
  try {
    const courses = await Course.find().select(
      "_id title isPublished totalEnrollments avgProgress"
    );
    res.json({
      totalCourses: courses.length,
      enrollmentStats: courses.map((course) => ({
        courseId: course._id,
        title: course.title,
        isPublished: course.isPublished,
        totalEnrolled: course.totalEnrollments,
        avgProgress: course.avgProgress,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch stats" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      query = { name: regex };
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .skip(skip)
      .limit(limit);

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getAllCoursesForAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {}; // No isPublished filter — include all courses

    if (search) {
      const regex = new RegExp(search, "i");
      query.title = regex;
    }

    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .populate("creator", "name email") // Include creator details
      .sort({ createdAt: -1 }); // newest first

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

module.exports = { getAdminStats, getAllUsers, getAllCoursesForAdmin };
