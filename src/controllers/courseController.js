const mongoose = require('mongoose');
const Course = require("../models/courseModel");
const {validateCourseInput,validateCourseUpdate} = require("../utils/validateCourseCreation")
const { s3, PutObjectCommand } = require("../utils/s3Client");
const { v4: uuidv4 } = require("uuid");

const BUCKET_NAME = "devlaunch-thumbnail";

const createCourse = async (req, res) => {
  try {
    const { title, description, category, isFree, price } = req.body;

    validateCourseInput(req.body);

    const file = req.file;

    const existingCourse = await Course.findOne({
      title: title.trim(),
      creator: req.user._id,
    });

    if (existingCourse) {
      return res.status(409).json({
        message:
          "Course with this title already exists for the current creator.",
      });
    }

    let thumbnailUrl = "";

    if (file) {
      const key = `thumbnails/${uuidv4()}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      thumbnailUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    const newCourse = new Course({
      title,
      description,
      category,
      isFree: isFree ?? true,
      price: isFree ? 0 : price,
      thumbnail: thumbnailUrl,
      creator: req.user._id, // set by userAuth middleware
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: "Course created successfully",
      course: savedCourse,
    });
  } catch (err) {
    console.error("Course creation error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    let query = { isPublished: true };

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      query.title = regex;
    }

    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .select("-videos") // exclude videos for performance
      .populate("creator", "name");

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total,
    });
  } catch (err) {
    console.error("Failed to fetch courses:", err.message);
    res.status(500).json({ message: "Server error while fetching courses" });
  }
};

const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ensure the logged-in admin is the creator
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You can only update your own courses' });
    }

    // Validate input before updating
    const {
      title,
      description,
      category,
      isFree,
      price,
      thumbnail,
      isPublished
    } = req.body;

    validateCourseUpdate({ title, description, category, isFree, price });

    // Update fields
    course.title = title?.trim();
    course.description = description?.trim();
    course.category = category;
    course.isFree = isFree ?? course.isFree;
    course.price = (isFree ?? course.isFree) ? 0 : price;
    course.thumbnail = thumbnail ?? course.thumbnail;
    course.isPublished = isPublished ?? course.isPublished;

      const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: course },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (err) {
    console.error('Course update error:', err.message);
    res.status(400).json({ message: err.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Fetch course
    const course = await Course.findOne({_id:id,isPublished:true})
      .populate('creator', 'name -_id');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ course });
  } catch (err) {
    console.error('Error fetching course:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Fetch course
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You can only delete your own courses' });
    }

    // Delete course
    await Course.findByIdAndDelete(id);

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Course deletion error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCourse,getAllCourses,updateCourse,getCourseById,deleteCourse };
