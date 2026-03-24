const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String }, // e.g. "Event Organizer", "Student", "Faculty"
  comment: { type: String, required: true },
  rating: { type: Number, default: 5 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
