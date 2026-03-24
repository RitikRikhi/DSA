const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Photo = require('./models/Photo');

const SOURCE_DIR = 'C:\\Users\\RITIK\\Downloads\\vistoso 26';
const TARGET_DIR = path.join(__dirname, 'uploads', 'photography');

async function syncVistoso() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
        }

        const files = fs.readdirSync(SOURCE_DIR);
        console.log(`Found ${files.length} files in ${SOURCE_DIR}`);

        for (const file of files) {
            const sourcePath = path.join(SOURCE_DIR, file);
            if (fs.lstatSync(sourcePath).isDirectory()) continue;

            const ext = path.extname(file).toLowerCase();
            let fileName = file;
            let type = 'image';

            if (ext) {
                if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) {
                    type = 'video';
                }
            } else {
                // If no extension, check if it's a known video source (like SaveClip.App)
                if (file.startsWith('SaveClip.App')) {
                    fileName = file + '.mp4';
                    type = 'video';
                } else {
                    fileName = file + '.jpg'; // Assume JPG otherwise
                }
            }

            const targetPath = path.join(TARGET_DIR, fileName);
            fs.copyFileSync(sourcePath, targetPath);

            const photo = new Photo({
                title: file.split('_')[0] || 'Vistoso Photo',
                imageUrl: `/uploads/photography/${fileName}`,
                type: type,
                category: 'photography'
            });

            await photo.save();
            console.log(`Synced: ${fileName} as ${type}`);
        }

        console.log('Sync completed successfully!');
    } catch (err) {
        console.error('Error during sync:', err);
    } finally {
        await mongoose.connection.close();
    }
}

syncVistoso();
