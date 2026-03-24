const mongoose = require("mongoose");
const Photo = require("./models/Photo");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Photo.find({ category: "achievements" });
  console.log(`Found ${result.length} photos with category 'achievements'`);
  if (result.length > 0) {
    console.log("First photo:", result[0]);
  }
  process.exit(0);
}
check();
