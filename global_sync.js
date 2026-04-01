const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { cloudinary } = require("./server/config/cloudinary");
const Photo = require("./server/models/Photo");

const uploadDirs = [
    path.join(__dirname, "server/uploads"),
    path.join(__dirname, "server/uploads/gallery"),
    path.join(__dirname, "server/uploads/photography"),
    path.join(__dirname, "client/uploads"),
    path.join(__dirname, "client/videos")
];

async function syncAll() {
    try {
        console.log("--- Global Gallery Sync Started ---");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected");

        for (const dir of uploadDirs) {
            if (!fs.existsSync(dir)) {
                console.log(`⚠️ Skipping missing directory: ${dir}`);
                continue;
            }

            console.log(`\nScanning: ${dir}`);
            const files = fs.readdirSync(dir);
            console.log(`Found ${files.length} items`);

            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.lstatSync(fullPath).isDirectory()) continue;

                const ext = path.extname(file).toLowerCase();
                const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
                const isVideo = [".mp4", ".mov", ".webm"].includes(ext);

                if (!isImage && !isVideo) continue;

                try {
                    console.log(`Processing: ${file}...`);
                    
                    // Determine category based on filename keywords
                    let category = "photography";
                    if (isVideo) category = "videography";
                    
                    const fileName = file.toLowerCase();
                    if (fileName.includes("achievement")) category = "achievements";
                    else if (fileName.includes("reel") || fileName.includes("short") || fileName.includes("social") || fileName.includes("saveclip.app")) category = "reels";
                    else if (fileName.includes("bts") || fileName.includes("behind") || fileName.includes("team") || fileName.includes("crew")) category = "team-bts";
                    else if (fileName.includes("sport") || fileName.includes("match") || fileName.includes("game") || fileName.includes("play") || /img_10\d\d/.test(fileName)) category = "sports";
                    else if (fileName.includes("vistoso") || fileName.includes("jasmine")) category = "vistoso";
                    else if (fileName.includes("archive") || fileName.includes("campus")) category = "archives";
                    else if (fileName.includes("poster") || fileName.includes("edit") || fileName.includes("graphics")) category = "editing";

                    // Check if already in DB (by filename or similar)
                    let photo = await Photo.findOne({ 
                        $or: [
                            { imageUrl: { $regex: file } },
                            { title: path.basename(file, ext) }
                        ]
                    });

                    if (photo && photo.imageUrl.startsWith("http")) {
                        console.log(`   ✅ Already in Cloud: ${photo.imageUrl}`);
                        // Update category if it was wrong
                        if(photo.category !== category) {
                            photo.category = category;
                            await photo.save();
                        }
                    } else {
                        // Upload to Cloudinary
                        console.log(`   🚀 Uploading ${file} to Cloudinary...`);
                        const result = await cloudinary.uploader.upload(fullPath, {
                            folder: "dsa_media_v2",
                            resource_type: isVideo ? "video" : "image"
                        });

                        if (photo) {
                            photo.imageUrl = result.secure_url;
                            photo.publicId = result.public_id;
                            photo.category = category;
                            await photo.save();
                            console.log(`   ✅ Record Updated: ${result.secure_url}`);
                        } else {
                            await Photo.create({
                                title: path.basename(file, ext).replace(/_/g, " ").replace(/-/g, " "),
                                imageUrl: result.secure_url,
                                publicId: result.public_id,
                                type: isVideo ? "video" : "image",
                                category: category
                            });
                            console.log(`   ✅ New Record Created: ${result.secure_url}`);
                        }
                    }
                } catch (e) {
                    console.error(`   ❌ Failed ${file}:`, e.message || e);
                }
            }
        }

        console.log("\n--- Global Sync Finished ---");
        process.exit(0);
    } catch (err) {
        console.error("❌ GLOBAL ERROR:", err);
        process.exit(1);
    }
}

syncAll();
