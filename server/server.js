require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "res.cloudinary.com"],
      "media-src": ["'self'", "data:", "res.cloudinary.com"],
    },
  },
}));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 })); // Increased for development
app.use(cors({
  origin: process.env.FRONTEND_URL || [
    "https://dsa-lksa.vercel.app",
    "https://dsa-media-crew.vercel.app", 
    "https://dsa-media-crew-git-main.vercel.app",
    "https://dsa-media-api.onrender.com",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));
app.use(express.json());

// Debug: Log the resolved paths
const clientPath = path.resolve(__dirname, "../client");
const adminPath = path.resolve(__dirname, "../admin");
console.log("Client path:", clientPath, "exists:", fs.existsSync(clientPath));
console.log("Admin path:", adminPath, "exists:", fs.existsSync(adminPath));

// Serve index.html for root route
app.get("/", (req, res) => {
  const indexPath = path.join(clientPath, "index.html");
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      console.error("Error reading index:", err);
      return res.status(500).send("Error loading page");
    }
    res.send(data.toString());
  });
});

// Serve gallery page
app.get("/gallery", (req, res) => {
  const galleryPath = path.join(clientPath, "gallery.html");
  fs.readFile(galleryPath, (err, data) => {
    if (err) {
      console.error("Error reading gallery:", err);
      return res.status(500).send("Error loading page");
    }
    res.send(data.toString());
  });
});

// Serve admin login page
app.get("/admin/login", (req, res) => {
  const loginPath = path.join(adminPath, "login.html");
  console.log("Trying to serve:", loginPath, "exists:", fs.existsSync(loginPath));
  fs.readFile(loginPath, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Error loading page");
    }
    res.send(data.toString());
  });
});

app.get("/admin/dashboard.html", (req, res) => {
  const dashboardPath = path.join(adminPath, "dashboard.html");
  fs.readFile(dashboardPath, (err, data) => {
    if (err) {
      console.error("Error reading dashboard:", err);
      return res.status(500).send("Error loading page");
    }
    res.send(data.toString());
  });
});

app.get("/admin", (req, res) => {
  const loginPath = path.join(adminPath, "login.html");
  fs.readFile(loginPath, (err, data) => {
    if (err) {
      return res.status(500).send("Error loading page");
    }
    res.send(data.toString());
  });
});

// Serve static files from admin
app.use("/admin", express.static(adminPath));
// Serve static files from client
app.use(express.static(clientPath));
// Local uploads serving removed - using Cloudinary instead
if (process.env.NODE_ENV !== "production") {
  app.use("/server/uploads", express.static(path.join(__dirname, "uploads")));
  app.use("/server/videos", express.static(path.join(__dirname, "videos")));
  console.log("DEV: Serving local uploads and videos.");
}

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/photos", require("./routes/photoRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

// Health check route
app.get("/api/health", (req, res) => {
  const status = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status,
    database: "MongoDB",
    connection_state: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// 404 Handler for undefined API routes
app.use("/api", (req, res, next) => {
  const AppError = require("./utils/appError");
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Catch-all route for any other request (404)
app.use((req, res) => {
  res.status(404).sendFile("404.html", { root: clientPath });
});

// Global Error Handler
const globalErrorHandler = require("./middleware/errorMiddleware");
app.use(globalErrorHandler);

// Create default admin account
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@dsa.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new Admin({
        email: "admin@dsa.com",
        password: hashedPassword
      });
      await admin.save();
      console.log("Default admin account created!");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log("MongoDB Connected");
  await createDefaultAdmin();
})
.catch(err => console.log(err));

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on " + (process.env.PORT || 3000))
);

module.exports = app;
