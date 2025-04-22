# 🎥 YouTube Clone Backend API

A fully functional, scalable backend API for a YouTube-like platform built with **Node.js**, **Express**, and **MongoDB**. This backend supports core YouTube features like user management, video uploads, likes, comments, and tweet-style short posts 
— all securely handled with **JWT authentication**, **Multer**, and **Cloudinary** integration.

---

## 🚀 Features

### 🔐 Authentication
- Secure login/register with **JWT (access + refresh)**
- Token validation middleware (`verifyJWT`)
- Secure HTTP-only cookie handling
- Password hashing

### 👤 User Module
- Profile details (username, avatar, cover)
- Avatar/Cover updates via **Cloudinary**
- Watch history

### 🎬 Video Module
- Upload & serve videos (via **Multer** to temp, then Cloudinary)
- Like, dislike, watch
- Fetch channel videos

### 💬 Comments
- Threaded comments on videos
- Replies, edit, delete

### 🐦 Tweet (Short Posts)
- Post, fetch, and interact with tweet-style posts

### ❤️ Likes System
- Like/unlike videos and tweets

---

## 🧱 Tech Stack

| Layer          | Tech                          |
|----------------|-------------------------------|
| **Backend**    | Node.js, Express.js            |
| **Database**   | MongoDB + Mongoose             |
| **Auth**       | JWT, Cookies                   |
| **File Upload**| Multer (local temp) + Cloudinary |
| **Error Handling** | Custom `ApiError` + `asyncHandler` |
| **Dev Tools**  | dotenv, nodemon, ESLint        |

---

## 🌐 API Endpoints

> Base URL: `/api`

| Method | Route                     | Description                  |
|--------|---------------------------|------------------------------|
| POST   | `/user/register`          | Register a new user          |
| POST   | `/user/login`             | Authenticate user            |
| GET    | `/user/profile/:username` | Fetch user profile           |
| PUT    | `/user/avatar`            | Update avatar                |
| GET    | `/videos/`                | Get all videos               |
| POST   | `/videos/upload`          | Upload new video             |
| POST   | `/comment`                | Add comment to video         |
| POST   | `/tweets`                 | Post a short tweet           |
| POST   | `/likes`                  | Like/unlike video/tweet      |

📌 More detailed API documentation can be added using Postman collection.

---
✅ Middleware Utilities
verifyJWT – Auth middleware using access token

asyncHandler – Wrapper to handle promise errors

ApiError – Custom error class

ApiResponse – Standard success response object

📈 Future Improvements
Full frontend (MERN stack)

Video streaming with progressive loading

Admin panel (user/video moderation)

Real-time comments (WebSocket)
