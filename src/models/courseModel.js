const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Design",
        "Other",
      ],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    videos: [
      {
        title: { type: String, required: true },
        key: { type: String, required: true },
        duration: { type: Number }, // in seconds or minutes
        _id: false,
      },
    ],
    thumbnail: {
      type: String, // URL to the image
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

courseSchema.index({ title: 1, creator: 1 }, { unique: true });

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
