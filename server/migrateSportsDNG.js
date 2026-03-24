require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Photo = require("./models/Photo");

const UPLOADS_DIR = path.join(__dirname, "uploads");

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration...");

        const sportsPhotos = await Photo.find({ category: "sports" });
        console.log(`Found ${sportsPhotos.length} sports photos in database.`);

        for (const photo of sportsPhotos) {
            if (photo.imageUrl.toLowerCase().endsWith(".dng")) {
                const oldFilename = path.basename(photo.imageUrl);
                const newFilename = oldFilename.replace(/\.dng$/i, ".jpg");
                const oldPath = path.join(UPLOADS_DIR, oldFilename);
                const newPath = path.join(UPLOADS_DIR, newFilename);

                if (fs.existsSync(oldPath)) {
                    console.log(`Converting ${oldFilename} to ${newFilename}...`);
                    try {
                        await sharp(oldPath)
                            .toFormat("jpeg")
                            .jpeg({ quality: 90 })
                            .toFile(newPath);
                        
                        console.log(`Converted: ${newFilename}`);

                        // Update DB entry
                        photo.imageUrl = `/uploads/${newFilename}`;
                        await photo.save();
                        console.log(`Updated DB entry for: ${newFilename}`);

                        // Optional: remove old DNG to save space (keeping it for now just in case)
                        // fs.unlinkSync(oldPath);
                    } catch (err) {
                        console.error(`Failed to convert ${oldFilename}:`, err.message);
                    }
                } else {
                    console.warn(`File not found in uploads: ${oldFilename}`);
                    // Still update DB if the file supposedly exists elsewhere or we want to fix the record
                    const possibleNewPath = photo.imageUrl.replace(/\.dng$/i, ".jpg");
                    // Check if JPG already exists
                    if (fs.existsSync(newPath)) {
                         photo.imageUrl = possibleNewPath;
                         await photo.save();
                         console.log(`Updated DB entry (JPG already exists): ${newFilename}`);
                    }
                }
            }
        }

        console.log("Migration completed.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
}

migrate();
