const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Photo = require("./models/Photo");
require("dotenv").config();

const SOURCE_DIR = "C:\\Users\\RITIK\\Downloads\\images";
const TARGET_DIR = path.join(__dirname, "uploads", "gallery");

async function seedBTS() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for BTS seeding...");

    // Create target dir if not exists
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SOURCE_DIR);
    console.log(`Found ${files.length} files in source directory.`);

    let count = 0;
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      // We'll skip HEIC for now or just copy them (browsers might not show them)
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const targetFile = `bts_${Date.now()}_${count}${ext}`;
        const targetPath = path.join(TARGET_DIR, targetFile);
        const sourcePath = path.join(SOURCE_DIR, file);

        fs.copyFileSync(sourcePath, targetPath);

        await Photo.create({
          title: "Team BTS",
          imageUrl: `/uploads/gallery/${targetFile}`,
          type: "image",
          category: "team-bts",
        });

        console.log(`Uploaded and seeded: ${file} to Team BTS`);
        count++;
      } else {
        console.warn(`Skipping non-supported file type: ${file}`);
      }
    }

    console.log(`Successfully seeded ${count} BTS images.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedBTS();
