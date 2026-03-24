require("dotenv").config();
const mongoose = require("mongoose");
const Photo = require("./models/Photo");

const photos = [
  {
    title: "Jasmine Sandlas Performance",
    imageUrl: "/uploads/jasmine1.png",
    type: "image",
    category: "events"
  },
  {
    title: "Jasmine Sandlas - White Background",
    imageUrl: "/uploads/jasmine2.png",
    type: "image",
    category: "cultural"
  },
  {
    title: "Energy at Cultural Fest",
    imageUrl: "/uploads/cultural1.png",
    type: "image",
    category: "cultural"
  },
  {
    title: "Campus Photography Session",
    imageUrl: "/uploads/campus1.png",
    type: "image",
    category: "photography"
  },
  {
    title: "Cinematic Event Coverage",
    imageUrl: "/uploads/video1.png",
    type: "video",
    category: "videography"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Optionally clear existing photos if you want a clean slate
    // await Photo.deleteMany({});
    // console.log("Cleared existing photos");

    await Photo.insertMany(photos);
    console.log("Sample data seeded successfully!");
    
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
