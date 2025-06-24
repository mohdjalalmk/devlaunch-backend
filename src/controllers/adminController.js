const Course = require("../models/courseModel");
const User = require("../models/userModel");


//TODO: Maintain aggregated stats inside each Course document, like:
// {
//   _id: "...",
//   title: "React Course",
//   totalEnrollments: 3200,
//   avgProgress: 54.2
// }
// Update these values on enrollments or progress updates

const getAdminStats = async (req, res) => {
  try {
    // 1. Total courses
    const totalCourses = await Course.countDocuments();

    // 2. Enrollment stats per course
    const courses = await Course.find().select("_id title");

    const enrollmentStats = await Promise.all(
      courses.map(async (course) => {
        const enrolledUsers = await User.find({
          "enrolledCourses.courseId": course._id,
        }).select("enrolledCourses");
console.log("enrolled users:", JSON.stringify(enrolledUsers));

const totalEnrolled = enrolledUsers.length;

// Calculate average progress (if any)
let totalProgressSum = 0;
let totalUsersWithProgress = 0;

for (const user of enrolledUsers) {
  const enrolledCourse = user.enrolledCourses.find((c) =>
    c.courseId.equals(course._id)
  );
  if (enrolledCourse && typeof enrolledCourse.progress === "number") {
    totalProgressSum += enrolledCourse.progress;
    totalUsersWithProgress++;
  }
}
const avgProgress =
  totalUsersWithProgress > 0
    ? totalProgressSum / totalUsersWithProgress
    : 0

        return {
          courseId: course._id,
          title: course.title,
          totalEnrolled,
          avgProgress: Number(avgProgress.toFixed(2)), // %
        };
      })
    );

    res.status(200).json({
      totalCourses,
      enrollmentStats,
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ message: "Could not fetch stats" });
  }
};

//TODO: Add pagination
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      query = { name: regex }
    }

    const users = await User.find(query).select("-passwordHash")
    .skip(skip)
    .limit(limit);


    res.status(200).json({ users });
  } catch (err) {
    console.error("Get Users Error:", err.message);
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
    console.error("Admin course fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

module.exports = { getAdminStats,getAllUsers,getAllCoursesForAdmin };
