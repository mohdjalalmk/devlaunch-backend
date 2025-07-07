const { s3, PutObjectCommand } = require("../utils/s3Client");
const Course = require("../models/courseModel");
const { v4: uuidv4 } = require("uuid");
const { GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const uploadVideo = async (req, res) => {
  try {
    const { title, duration,description } = req.body;
    const { id: courseId } = req.params;
    const file = req.file;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied: You can only add your own course videos",
      });
    }

    if (!file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const key = `videos/${uuidv4()}-${file.originalname}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.VIDEOS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    // Update course with the new video metadata (store only the key)

    course.videos.push({
      title,
      description,
      key, // store key, not full URL
      duration: Number(duration),
    });

    await course.save();

    res.status(200).json({ message: "Video uploaded successfully", key });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};

const getSignedVideoUrl = async (req, res) => {
  try {
    const key = req.query.key;
    const courseId = req.params.id;
    const user = req.user;
    const isEnrolled = user.enrolledCourses.some((courseObj) =>
      courseObj.courseId.equals(courseId)
    );

    if (!isEnrolled) {
      return res.status(403).json({
        message: "Access denied. You are not enrolled in this course.",
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.VIDEOS_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 60 * 4,
    }); // 4 hour

    res.json({ url: signedUrl });
  } catch (err) {
    res.status(500).json({ message: "Could not generate signed URL" });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const videoKey = req.query.key;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Ensure only the course creator can delete videos
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message:
          "Access denied: You can only delete videos from your own course",
      });
    }

    // Check if video exists in course
    const videoIndex = course.videos.findIndex(
      (video) => video.key === videoKey
    );
    if (videoIndex === -1) {
      return res.status(404).json({ message: "Video not found in course" });
    }

    // Remove video from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.VIDEOS_BUCKET_NAME,
      Key: videoKey,
    });
    await s3.send(command);

    // Remove video from MongoDB
    course.videos.splice(videoIndex, 1);
    await course.save();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete video" });
  }
};

module.exports = { uploadVideo, getSignedVideoUrl, deleteVideo };
