const mongoose = require('mongoose');
const Course = require("../models/courseModel");
const {validateCourseInput,validateCourseUpdate} = require("../utils/validateCourseCreation")
const { s3, PutObjectCommand } = require("../utils/s3Client");
const { v4: uuidv4 } = require("uuid");


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
        Bucket: process.env.THUMBNAIL_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      thumbnailUrl = `https://${process.env.THUMBNAIL_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    const newCourse = new Course({
      title,
      description,
      category,
      isFree: isFree ?? true,
      price: isFree ? 0 : price,
      thumbnail: thumbnailUrl,
      creator: req.user._id,
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: "Course created successfully",
      course: savedCourse,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

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
      .select("-videos") 
      .populate("creator", "name");

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching courses" });
  }
};

const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied: You can only update your own courses",
      });
    }

    const { title, description, category, isFree, price, isPublished } =
      req.body;

    const file = req.file;

    validateCourseUpdate({ title, description, category, isFree, price });

    // Handle thumbnail upload (if a new file is provided)
    let thumbnailUrl = course.thumbnail;
    if (file) {
      const key = `thumbnails/${uuidv4()}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: process.env.THUMBNAIL_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      thumbnailUrl = `https://${process.env.THUMBNAIL_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    course.title = title?.trim() || course.title;
    course.description = description?.trim() || course.description;
    course.category = category || course.category;
    course.isFree = isFree ?? course.isFree;
    course.price = price;
    course.thumbnail = thumbnailUrl;
    course.isPublished = isPublished ?? course.isPublished;

    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const query = { _id: id };
    if (req.user.role !== "admin") {
      query.isPublished = true;
    }

    const course = await Course.findOne(query).populate("creator", "name _id");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ course });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCourse,getAllCourses,updateCourse,getCourseById,deleteCourse };
