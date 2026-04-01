const mongoose = require("mongoose");
require("dotenv").config();
const Photo = require("./server/models/Photo");

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  const categories = await Photo.distinct("category");
  console.log("ALL CATEGORIES IN DB:", JSON.stringify(categories, null, 2));
  
  for (const cat of categories) {
    const p = await Photo.findOne({ category: cat });
    const count = await Photo.countDocuments({ category: cat });
    console.log(`${cat}: ${count} items (Sample: ${p ? p.title : 'N/A'})`);
  }
  process.exit(0);
}
verify();
