const mongoose = require("mongoose");
const Photo = require("./models/Photo");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const photos = await Photo.find({ category: "achievements" });
  console.log(`Checking category 'achievements': found ${photos.length}`);
  if (photos.length > 0) {
    console.log(`Length: ${photos[0].category.length}`);
    console.log(`Exact: "${photos[0].category}"`);
  }
  process.exit(0);
}
check();
