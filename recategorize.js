const mongoose = require('mongoose');
require('dotenv').config();
const Photo = require('./server/models/Photo');

async function recategorize() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const photos = await Photo.find({});
        console.log(`Found ${photos.length} items to process.`);

        let updates = 0;
        for (const photo of photos) {
            let newCategory = 'photography'; // Default image category
            const title = (photo.title || '').toLowerCase();
            const isVideo = photo.type === 'video';

            // 1. Videography fallback
            if (isVideo) newCategory = 'videography';

            // 2. Specific Keyword Overrides
            if (title.includes('jasmine') || title.includes('vistoso') || title.includes('vistozo') || title.includes('show') || title.includes('stage') || title.includes('perform')) {
                newCategory = 'vistoso';
            } else if (title.includes('achievement') || title.includes('winner') || title.includes('award') || title.includes('spotlight') || title.includes('won') || title.includes('certificate')) {
                newCategory = 'achievements';
            } else if (title.includes('design') || title.includes('edit') || title.includes('poster') || title.includes('graphic') || title.includes('psd') || title.includes('logo')) {
                newCategory = 'editing';
            } else if (title.includes('reel') || title.includes('short') || title.includes('insta')) {
                newCategory = 'reels';
            } else if (title.includes('sport') || title.includes('athletic') || title.includes('game') || title.includes('match')) {
                newCategory = 'sports';
            } else if (title.includes('behind') || title.includes('bts') || title.includes('team') || title.includes('crew')) {
                newCategory = 'team-bts';
            }

            // Update only if changed
            if (photo.category !== newCategory) {
                photo.category = newCategory;
                await photo.save();
                updates++;
            }
        }

        console.log(`Successfully updated ${updates} items.`);
        
        // Final summary
        const finalStats = await Photo.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        console.log('Final distribution:', finalStats);
        
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

recategorize();
