const router = require("express").Router();
const Photo = require("../models/Photo");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "./server/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|webm|ogg|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images and Videos Only!"));
    }
  }
});

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Upload a new photo/video
router.post("/", auth, upload.single("image"), catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Please upload an image or video", 400));
  
  const isVideo = req.file.mimetype.startsWith('video/');
  const photo = new Photo({
    title: req.body.title,
    imageUrl: `/uploads/${req.file.filename}`,
    type: isVideo ? 'video' : 'image',
    category: req.body.category || ''
  });
  await photo.save();
  res.json(photo);
}));

// Get all photos with pagination
router.get("/", catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000; // Large default if no limit
  const skip = (page - 1) * limit;
  const category = req.query.category;

  let filter = {};
  if (category && category !== 'all') {
    filter = { category: category };
  }

  const photos = await Photo.find(filter)
    .sort({ uploadedAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit);

  const total = await Photo.countDocuments(filter);

  res.json({
    photos,
    total,
    page,
    pages: Math.ceil(total / limit),
    hasMore: page * limit < total
  });
}));

// Delete a photo
router.delete("/:id", auth, catchAsync(async (req, res, next) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) {
    return next(new AppError("Photo not found", 404));
  }

  // Delete the file from filesystem
  const filePath = path.join(__dirname, "..", "..", photo.imageUrl); // Fixed path
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Delete from database
  await Photo.findByIdAndDelete(req.params.id);
  res.json({ msg: "Photo deleted" });
}));

module.exports = router;
