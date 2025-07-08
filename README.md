# 🛠 DevLaunch Backend

This is the **Node.js + Express** backend for the DevLaunch e-learning platform.
It handles APIs for authentication, courses, video streaming, progress tracking, and certificate generation.

---

## 📦 Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/mohdjalalmk/devlaunch-backend.git
cd devlaunch-backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
JWT_SECRET=...
```

### 4️⃣ Run the server

```bash
npm run dev
```

The server will start on `http://localhost:8080` by default.

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MongoDB & Mongoose
* AWS S3 (for video & certificate storage)
* PDFKit (certificate generation)
* dotenv, cors, cookie-parser

---

## ✏️ Author

**Mohamed Jalal M K**

MIT License

> 🌟 Feel free to fork, star, and contribute!
