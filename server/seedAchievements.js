const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Photo = require("./models/Photo");
require("dotenv").config();

const SOURCE_DIR = "C:\\Users\\RITIK\\Downloads\\spotlight";
const TARGET_DIR = path.join(__dirname, "uploads", "gallery");

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Achievements seeding...");

    // Create target dir if not exists
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    if (!fs.existsSync(SOURCE_DIR)) {
      console.error(`Source directory not found: ${SOURCE_DIR}`);
      process.exit(1);
    }

    const files = fs.readdirSync(SOURCE_DIR);
    console.log(`Found ${files.length} files in source directory.`);

    let count = 0;
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const targetFile = `achievement_${Date.now()}_${count}${ext}`;
        const targetPath = path.join(TARGET_DIR, targetFile);
        const sourcePath = path.join(SOURCE_DIR, file);

        fs.copyFileSync(sourcePath, targetPath);

        await Photo.create({
          title: "Team Achievement",
          imageUrl: `/uploads/gallery/${targetFile}`,
          type: "image",
          category: "achievements",
        });

        console.log(`Uploaded and seeded: ${file} to Achievements`);
        count++;
      } else {
        console.warn(`Skipping non-supported file type: ${file}`);
      }
    }

    console.log(`Successfully seeded ${count} Achievement images.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedAchievements();
