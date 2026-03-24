require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Photo = require("./models/Photo");

const DOWNLOADS_DIR = "C:\\Users\\RITIK\\Downloads\\sport";
const UPLOADS_DIR = path.join(__dirname, "uploads");

const syncSports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for sports sync...");

    // Get existing sports photo URLs from DB
    const existingPhotos = await Photo.find({ category: "sports" });
    const existingFilenames = new Set(existingPhotos.map(p => path.basename(p.imageUrl)));

    // Get files from downloads
    if (!fs.existsSync(DOWNLOADS_DIR)) {
        console.error("Downloads directory not found:", DOWNLOADS_DIR);
        process.exit(1);
    }
    const files = fs.readdirSync(DOWNLOADS_DIR);
    
    // Check for both .dng and .jpg to prevent duplicates
    const newFiles = files.filter(f => {
        const base = path.basename(f, path.extname(f));
        const isDng = f.toLowerCase().endsWith('.dng');
        const isJpg = f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg');
        
        if (!isDng && !isJpg) return false;
        
        // Already exists in DB?
        if (existingFilenames.has(f)) return false;
        
        // If it's a DNG, check if its JPG version exists in DB
        if (isDng && (existingFilenames.has(base + '.jpg') || existingFilenames.has(base + '.jpeg'))) return false;
        
        return true;
    });

    if (newFiles.length === 0) {
      console.log("No new sports photos found.");
      mongoose.connection.close();
      return;
    }

    console.log(`Found ${newFiles.length} new sports photos. Syncing...`);

    const photosToAdd = [];
    let sportsIndex = existingPhotos.length + 1;

    for (const file of newFiles) {
      const srcPath = path.join(DOWNLOADS_DIR, file);
      const isDng = file.toLowerCase().endsWith('.dng');
      const destFilename = isDng ? file.replace(/\.dng$/i, '.jpg') : file;
      const destPath = path.join(UPLOADS_DIR, destFilename);

      if (isDng) {
          console.log(`Converting ${file} to ${destFilename}...`);
          await sharp(srcPath)
              .rotate() // Auto-rotate based on EXIF
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(destPath);
          console.log(`Converted and saved: ${destFilename}`);
      } else {
          // Copy file
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied: ${file}`);
      }

      // Prepare DB entry
      photosToAdd.push({
        title: `Sports Gallery ${sportsIndex++}`,
        imageUrl: `/uploads/${destFilename}`,
        category: "sports"
      });
    }

    await Photo.insertMany(photosToAdd);
    console.log(`${photosToAdd.length} new sports photos seeded successfully!`);
    
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error syncing sports photos:", error);
    process.exit(1);
  }
};

syncSports();
