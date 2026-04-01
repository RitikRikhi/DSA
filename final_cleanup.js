const mongoose = require("mongoose");
require("dotenv").config();
const Photo = require("./server/models/Photo");

async function cleanup() {
    try {
        console.log("--- Gallery Final Cleanup Started ---");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected");

        // 1. Delete all videography records
        const deleted = await Photo.deleteMany({ 
            $or: [
                { category: "videography" },
                { category: "videography-aftermovies" }
            ]
        });
        console.log(`🗑️ Deleted ${deleted.deletedCount} items from Videography`);

        // 2. Remove any remaining local paths as a safety measure
        const localDeleted = await Photo.deleteMany({ imageUrl: { $regex: /^\/uploads/ } });
        console.log(`🗑️ Deleted ${localDeleted.deletedCount} remaining local path references`);

        // 3. Rename all remaining titles
        const remaining = await Photo.find({});
        console.log(`🎨 Renaming ${remaining.length} records...`);
        
        const counts = {};
        for (const p of remaining) {
            const cat = p.category;
            counts[cat] = (counts[cat] || 0) + 1;
            
            const displayCat = cat.replace(/-/g, " ").toUpperCase();
            p.title = `DSA MEDIA CREW - ${displayCat} ${counts[cat]}`;
            await p.save();
        }

        console.log("✅ Cleanup and Standardization Finished!");
        process.exit(0);
    } catch (err) {
        console.error("❌ CLEANUP ERROR:", err);
        process.exit(1);
    }
}

cleanup();
