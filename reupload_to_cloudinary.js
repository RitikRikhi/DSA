const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { cloudinary } = require('./server/config/cloudinary');
const Photo = require('./server/models/Photo');

async function migrate() {
    try {
        console.log('--- Media Migration Script ---');
        
        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI missing from .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const dirs = [
            path.join(__dirname, 'client/uploads'),
            path.join(__dirname, 'client/videos')
        ];

        for (const dir of dirs) {
            if (fs.existsSync(dir)) {
                console.log(`\nScanning directory: ${dir}`);
                await uploadDir(dir);
            } else {
                console.log(`⚠️  Directory not found: ${dir}`);
            }
        }

        console.log('\n--- Migration Finished ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ GLOBAL ERROR:', err);
        process.exit(1);
    }
}

async function uploadDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    console.log(`Found ${files.length} items in ${path.basename(dirPath)}`);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            await uploadDir(fullPath);
            continue;
        }

        const ext = path.extname(file).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        const isVideo = ['.mp4', '.mov', '.webm', '.avi'].includes(ext);

        if (!isImage && !isVideo) continue;

        console.log(`Uploading: ${file}...`);
        try {
            const result = await cloudinary.uploader.upload(fullPath, {
                folder: 'dsa_media',
                resource_type: isVideo ? 'video' : 'image'
            });

            const parentFolder = path.basename(dirPath).toLowerCase();
            const category = ['photography', 'videography', 'editing', 'team-bts', 'reels', 'archives'].includes(parentFolder) 
                ? parentFolder 
                : 'archive';

            const newPhoto = new Photo({
                title: path.basename(file, ext),
                imageUrl: result.secure_url,
                publicId: result.public_id,
                type: isVideo ? 'video' : 'image',
                category: category
            });

            await newPhoto.save();
            console.log(`   ✅ Success: ${result.secure_url}`);
        } catch (err) {
            console.error(`   ❌ Failed ${file}:`, err.message || err);
        }
    }
}

migrate();
