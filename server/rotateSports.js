require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Photo = require("./models/Photo");

const UPLOADS_DIR = path.join(__dirname, "uploads");

async function rotate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for rotation...");

        const sportsPhotos = await Photo.find({ category: "sports" });
        console.log(`Found ${sportsPhotos.length} sports photos to rotate.`);

        for (const photo of sportsPhotos) {
            const filename = path.basename(photo.imageUrl);
            const filePath = path.join(UPLOADS_DIR, filename);
            const tempPath = path.join(UPLOADS_DIR, `temp_${filename}`);

            if (fs.existsSync(filePath)) {
                console.log(`Rotating ${filename} by 90 degrees...`);
                try {
                    await sharp(filePath)
                        .rotate(90) // Rotate by 90 degrees clockwise
                        .toFile(tempPath);
                    
                    fs.unlinkSync(filePath);
                    fs.renameSync(tempPath, filePath);
                    console.log(`Rotated: ${filename}`);
                } catch (err) {
                    console.error(`Failed to rotate ${filename}:`, err.message);
                }
            } else {
                console.warn(`File not found: ${filename}`);
            }
        }

        console.log("Rotation completed.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Rotation error:", error);
        process.exit(1);
    }
}

rotate();
