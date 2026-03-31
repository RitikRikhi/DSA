const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Photo = require('./server/models/Photo');

dotenv.config();

async function checkPhotos() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const photos = await Photo.find().limit(5);
    console.log('Sample Photos:');
    photos.forEach(p => {
      console.log(`Title: ${p.title}, URL: ${p.imageUrl}, PublicID: ${p.publicId}`);
    });

    const localPhotos = await Photo.countDocuments({ imageUrl: { $regex: /^\/uploads/ } });
    const cloudinaryPhotos = await Photo.countDocuments({ imageUrl: { $regex: /^http/ } });

    console.log(`Total Photos with local paths (/uploads): ${localPhotos}`);
    console.log(`Total Photos with Cloudinary paths (http): ${cloudinaryPhotos}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPhotos();
