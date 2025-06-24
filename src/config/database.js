// src/config/db.js
const mongoose = require('mongoose');

const DATA_BASE_URI = "mongodb+srv://jalalm:fSTgObAgcy28VlGx@devluanchcluster.ef8xjdv.mongodb.net/devluanch"
const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATA_BASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then((conn) => {
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      resolve();
    })
    .catch((err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      reject(err);
    });
  });
};

module.exports = connectDB;
