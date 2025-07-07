const { generateCertificateBuffer } = require("../utils/generateCertificate.js");
const { 
  uploadCertificateToS3, 
  generateSignedUrl 
} = require("../utils/uploadCertificateToS3.js");
const Course = require("../models/courseModel.js");

const generateCertificate = async (req, res) => {
  try {
    const user = req.user;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Find the enrolled course entry
    const enrolledCourse = user.enrolledCourses.find(
      (c) => c.courseId.toString() === courseId
    );

    if (!enrolledCourse) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    if (enrolledCourse.progress < 100) {
      return res.status(403).json({ message: "Course not yet completed" });
    }

    // If certificate already exists in DB
    if (enrolledCourse.certificate) {
      const signedUrl = await generateSignedUrl(enrolledCourse.certificate);
      return res.status(200).json({ certificateUrl: signedUrl });
    }

    // Generate certificate PDF buffer
    const pdfBuffer = await generateCertificateBuffer({
      name: user.name,
      courseTitle: course.title,
    });

    // Upload to S3 — get the S3 Key
    const s3Key = await uploadCertificateToS3(pdfBuffer, user._id, courseId);

    // Save only the key in DB
    enrolledCourse.certificate = s3Key;
    await user.save();

    // Generate signed URL to return
    const signedUrl = await generateSignedUrl(s3Key);

    res.status(200).json({ certificateUrl: signedUrl });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports =  { generateCertificate };
