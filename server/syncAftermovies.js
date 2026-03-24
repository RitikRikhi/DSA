require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Photo = require("./models/Photo");

const SOURCE_DIR = "C:\\Users\\RITIK\\Downloads\\aftermovies";
const TARGET_DIR = path.join(__dirname, "uploads", "videography");

async function syncAftermovies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for aftermovies sync...");

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
      const sourcePath = path.join(SOURCE_DIR, file);
      
      // Skip directories
      if (fs.statSync(sourcePath).isDirectory()) continue;

      let ext = path.extname(file).toLowerCase();
      let baseName = path.basename(file, ext);
      
      // Handle files without extensions - assume .mp4 if they look like the others
      if (!ext && file.startsWith("SaveClip.App_")) {
          ext = ".mp4";
      }

      // Check if it's a video
      if ([".mp4", ".mov", ".webm", ".mkv"].includes(ext) || !ext) {
        const finalExt = ext || ".mp4";
        const targetFile = `aftermovie_${Date.now()}_${count}${finalExt}`;
        const targetPath = path.join(TARGET_DIR, targetFile);

        fs.copyFileSync(sourcePath, targetPath);

        await Photo.create({
          title: `Aftermovie ${count + 1}`,
          imageUrl: `/uploads/videography/${targetFile}`,
          type: "video",
          category: "videography",
        });

        console.log(`Uploaded and seeded: ${file} as Aftermovie`);
        count++;
      } else {
        console.warn(`Skipping non-supported file type: ${file}`);
      }
    }

    console.log(`Successfully synced ${count} aftermovies.`);
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
}

syncAftermovies();
