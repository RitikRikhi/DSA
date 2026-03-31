const mongoose = require('mongoose');
require('dotenv').config();
const Photo = require('./server/models/Photo');

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Find all photos with local paths
    const localPhotos = await Photo.find({ 
      imageUrl: { $regex: /^\/(uploads|videos)/ } 
    });

    console.log(`Found ${localPhotos.length} broken local links.`);

    if (localPhotos.length > 0) {
      const result = await Photo.deleteMany({ 
        imageUrl: { $regex: /^\/(uploads|videos)/ } 
      });
      console.log(`Successfully deleted ${result.deletedCount} broken media records.`);
    } else {
      console.log('No broken links found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanup();
