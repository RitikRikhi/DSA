const mongoose = require("mongoose");
const Photo = require("./models/Photo");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const photos = await Photo.find({ imageUrl: { $regex: "achievement_" } });
  console.log(`Checking photos with achievement in URL: ${photos.length}`);
  if (photos.length > 0) {
    console.log("Categories found:", [...new Set(photos.map(p => p.category))]);
    console.log("Full first photo object:", JSON.stringify(photos[0], null, 2));
  }
  process.exit(0);
}
check();
