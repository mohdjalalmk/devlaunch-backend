const express = require('express');
const connectDB = require('./src/config/database');
const cookieParser = require('cookie-parser'); 
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // allow frontend origin
  })
);

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const adminRoutes = require('./src/routes/adminRoutes')



// Routes
app.use('/auth', authRoutes); // Base path for auth

app.use('/user', userRoutes);

app.use('/courses', courseRoutes);

app.use("/admin", adminRoutes);



app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = 8080;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server due to DB error:', err.message);
    process.exit(1);
  });
