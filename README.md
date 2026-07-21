# NextNews (MERN Stack)

NextNews is a full-stack, feature-rich news aggregation and community platform built with the MERN stack (MongoDB, Express, React, Node.js). It seamlessly blends real-time news updates with a dynamic, engaging community forum where users can read, write, and discuss articles.

## 🚀 Features

- **User Authentication**: Secure JWT-based login, registration, and profile management.
- **Profile Dashboard**: Dedicated sections for users to manage their Account Details, Security (Passwords), and view their authored, liked, and saved articles.
- **Community Articles (CRUD)**: Users can create, read, update, and delete their own community posts. Includes rich media support via Cloudinary image uploads.
- **Interactive Engagement**:
  - Like and Bookmark/Save articles.
  - Nested commenting system (top-level comments and nested replies).
  - Like, edit, and delete comments/replies.
- **Global News Integration**: Fetches top headlines and searchable global news via a secure backend proxy to NewsAPI.org.
- **Modern UI/UX**: Fully responsive, beautiful interface built with Vite, React 19, and Tailwind CSS 4, featuring smooth micro-animations and custom toast notifications.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19 powered by Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **File Uploads**: Multer & Cloudinary
- **External API**: NewsAPI.org (Proxied via backend for security)

---

## 📁 Project Structure

The repository is structured as a monorepo containing both the frontend and backend applications.

```
nextnews/
├── backend/                  # Express.js Server
│   ├── src/
│   │   ├── controllers/      # Route logic (articles, comments, users, news)
│   │   ├── db/               # MongoDB connection setup
│   │   ├── middlewares/      # JWT verification, Multer upload configs
│   │   ├── models/           # Mongoose schemas (User, Article, Comment)
│   │   └── routes/           # API endpoint definitions
│   ├── public/               # Temporary static storage for file uploads
│   ├── server.js             # Main application entry point
│   └── package.json
│
└── frontend/                 # React + Vite Client
    ├── src/
    │   ├── components/       # Reusable UI components (Header, Footer, Loaders)
    │   ├── pages/
    │   │   ├── article/      # Individual news article views
    │   │   ├── auth/         # Login, Signup, Edit Profile dashboard
    │   │   ├── category/     # Category-specific news feeds
    │   │   ├── community/    # Community feed, Post creation/editing, Detailed Post views
    │   │   └── search/       # News search results
    │   ├── App.jsx           # Main React Router setup
    │   ├── globals.css       # Tailwind entry and global styles
    │   └── main.jsx          # React DOM render entry
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [MongoDB](https://www.mongodb.com/) URI (Local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [NewsAPI](https://newsapi.org/) key

---

## 🔧 Local Development Setup

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_jwt_secret
   ACCESS_TOKEN_EXPIRY=1d
   
   # Cloudinary Keys
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # NewsAPI Key
   NEWS_API_KEY=your_newsapi_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 Core API Routes Overview

- **Users**: `/api/v1/users` (Register, Login, Update Profile, Update Password, Upload Avatar)
- **Articles**: `/api/v1/articles` (CRUD operations for community posts, Like, Save, Fetch Feeds)
- **Comments**: `/api/v1/comments` (Add top-level comments, Add replies, Edit, Delete, Like)
- **NewsAPI**: `/api/v1/news` (Proxies requests for `/top-headlines` and `/everything` to avoid CORS & hide API keys)

---

## 🤝 Contributing

Contributions are always welcome. Feel free to fork the repository, create a feature branch, and submit a Pull Request.

