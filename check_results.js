const mongoose = require("mongoose");
require("dotenv").config();
const Photo = require("./server/models/Photo");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const counts = await Photo.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  console.log("FINAL DISTRIBUTION:");
  console.log(JSON.stringify(counts, null, 2));
  process.exit(0);
}
check();
