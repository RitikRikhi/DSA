const mongoose = require("mongoose");

module.exports = mongoose.model("Photo", new mongoose.Schema({
  title: String,
  imageUrl: String,
  publicId: String, // Added for Cloudinary deletion
  type: { type: String, default: 'image' },
  category: String,
  rotation: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
}));