const Photo = require("./models/Photo");
const mongoose = require("mongoose");
require("dotenv").config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const category = "achievements";
  const photos = await Photo.find({ category: category });
  console.log(`Photos found for category '${category}': ${photos.length}`);
  photos.forEach(p => console.log(`- ${p.imageUrl}`));
  process.exit(0);
}
test();
