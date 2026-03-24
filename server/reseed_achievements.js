const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Photo = require("./models/Photo");
require("dotenv").config();

const SOURCE_DIR = "C:\\Users\\RITIK\\Downloads\\spotlight";
const TARGET_DIR = path.join(__dirname, "uploads", "gallery");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");

    // Clean up existing achievements to avoid confusion
    const deleted = await Photo.deleteMany({ category: "achievements" });
    console.log(`Deleted ${deleted.deletedCount} old achievements`);

    const files = fs.readdirSync(SOURCE_DIR);
    console.log(`Scanning ${files.length} files...`);

    let count = 0;
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const targetFile = `achievement_${Date.now()}_${count}${ext}`;
        const targetPath = path.join(TARGET_DIR, targetFile);
        
        fs.copyFileSync(path.join(SOURCE_DIR, file), targetPath);

        await Photo.create({
          title: "Team Achievement",
          imageUrl: `/uploads/gallery/${targetFile}`,
          type: "image",
          category: "achievements"
        });
        count++;
        console.log(`Seeded: ${file}`);
      }
    }
    console.log(`FINAL COUNT: ${count}`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
