// src/config/db.js
const mongoose = require('mongoose');

const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then((conn) => {
      resolve();
    })
    .catch((err) => {
      reject(err);
    });
  });
};

module.exports = connectDB;
