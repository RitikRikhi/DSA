const mongoose = require("mongoose");
require("dotenv").config();
const Photo = require("./server/models/Photo");

async function refactor() {
    try {
        console.log("--- Gallery Data Refactoring Started ---");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected");

        // 1. Move Reels to Archives
        const reelsToArchives = await Photo.updateMany({ category: "reels" }, { $set: { category: "archives" } });
        console.log(`📦 Moved ${reelsToArchives.modifiedCount} items from Reels to Archives`);

        // 2. Remove Photography
        const deletedPhotography = await Photo.deleteMany({ category: "photography" });
        console.log(`🗑️ Deleted ${deletedPhotography.deletedCount} items from Photography`);

        // 3. Remove specific Vistoso (Vistoso 5 and 6)
        // Using regex to catch variants of the title
        const deletedVistoso = await Photo.deleteMany({ 
            category: "vistoso", 
            title: { $regex: /VISTOSO [56]/i } 
        });
        console.log(`🗑️ Deleted ${deletedVistoso.deletedCount} specific Vistoso items (5 and 6)`);

        // 4. Final Title Standardization and Indexing
        const remaining = await Photo.find({}).sort({ category: 1, _id: 1 });
        console.log(`🎨 Re-standardizing titles for ${remaining.length} items...`);
        
        const counts = {};
        for (const p of remaining) {
            const cat = p.category;
            counts[cat] = (counts[cat] || 0) + 1;
            
            const displayCat = cat.replace(/-/g, " ").toUpperCase();
            p.title = `DSA MEDIA CREW - ${displayCat} ${counts[cat]}`;
            await p.save();
        }

        console.log("✅ Data Refactoring Finished!");
        process.exit(0);
    } catch (err) {
        console.error("❌ REFACTOR ERROR:", err);
        process.exit(1);
    }
}

refactor();
