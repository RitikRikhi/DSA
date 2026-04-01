const mongoose = require('mongoose');
require('dotenv').config();
const Photo = require('./server/models/Photo');

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const categories = await Photo.distinct('category');
        console.log('Unique categories in database:', categories);
        
        for (const cat of categories) {
            const count = await Photo.countDocuments({ category: cat });
            console.log(`- ${cat}: ${count} items`);
            if (cat === 'archive') {
                const samples = await Photo.find({ category: cat }).limit(100);
                console.log('Sample titles in archive:');
                samples.forEach(s => console.log(`  - ${s.title} (${s.type})`));
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCategories();
