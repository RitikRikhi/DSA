require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Photo = require("./models/Photo");

const DOWNLOADS_DIR = "C:\\Users\\RITIK\\Downloads\\campus life";
const UPLOADS_DIR = path.join(__dirname, "uploads");

const syncArchives = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for archive sync...");

    // Get existing archive photo URLs from DB
    const existingPhotos = await Photo.find({ category: "archives" });
    const existingFilenames = new Set(existingPhotos.map(p => path.basename(p.imageUrl)));

    // Get files from downloads
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const newFiles = files.filter(f => !existingFilenames.has(f));

    if (newFiles.length === 0) {
      console.log("No new photos found.");
      mongoose.connection.close();
      return;
    }

    console.log(`Found ${newFiles.length} new photos. Syncing...`);

    const photosToAdd = [];
    let archiveIndex = existingPhotos.length + 1;

    for (const file of newFiles) {
      const srcPath = path.join(DOWNLOADS_DIR, file);
      const destPath = path.join(UPLOADS_DIR, file);

      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);

      // Prepare DB entry
      photosToAdd.push({
        title: `Campus Life Archive ${archiveIndex++}`,
        imageUrl: `/uploads/${file}`,
        category: "archives"
      });
    }

    await Photo.insertMany(photosToAdd);
    console.log(`${photosToAdd.length} new archive photos seeded successfully!`);
    
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error syncing archives:", error);
    process.exit(1);
  }
};

syncArchives();
