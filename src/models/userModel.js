// src/models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  enrolledCourses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      progress: {
        type:Number,
        default:0
      }
    }
  ]

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
