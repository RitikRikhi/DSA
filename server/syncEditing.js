require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Photo = require("./models/Photo");

const EDITS_DIR = "C:\\Users\\RITIK\\Downloads\\edits";
const UPLOADS_DIR = path.join(__dirname, "uploads");

const syncEditing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for editing sync...");

    // Get existing editing photo URLs from DB to avoid duplicates
    const existingPhotos = await Photo.find({ category: "editing" });
    const existingFilenames = new Set(existingPhotos.map(p => path.basename(p.imageUrl)));

    // Get files from downloads
    if (!fs.existsSync(EDITS_DIR)) {
        console.error("Edits directory not found:", EDITS_DIR);
        process.exit(1);
    }
    const files = fs.readdirSync(EDITS_DIR);
    
    // Filter for valid media
    const newFiles = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        const isMedia = ['.mp4', '.mov', '.webm', '.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        
        if (!isMedia) return false;
        
        // Already exists in DB?
        if (existingFilenames.has(f)) return false;
        
        return true;
    });

    if (newFiles.length === 0) {
      console.log("No new editing media found.");
      mongoose.connection.close();
      return;
    }

    console.log(`Found ${newFiles.length} new editing files. Syncing...`);

    const mediaToAdd = [];
    let editingIndex = existingPhotos.length + 1;

    for (const file of newFiles) {
      const srcPath = path.join(EDITS_DIR, file);
      const destPath = path.join(UPLOADS_DIR, file);

      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);

      const ext = path.extname(file).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.webm'].includes(ext);

      // Prepare DB entry
      mediaToAdd.push({
        title: `Editing Work ${editingIndex++}`,
        imageUrl: `/uploads/${file}`,
        type: isVideo ? 'video' : 'image',
        category: "editing"
      });
    }

    await Photo.insertMany(mediaToAdd);
    console.log(`${mediaToAdd.length} new editing items seeded successfully!`);
    
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error syncing editing photos:", error);
    process.exit(1);
  }
};

syncEditing();
