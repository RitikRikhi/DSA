const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Photo = require("./server/models/Photo");

// Data from seedArchives.js
const archivePhotos = [
  { title: "Campus Life Archive 1", imageUrl: "/uploads/SaveClip.App_638858792_17874209091540340_5824892488756174883_n.jpg", category: "archives" },
  { title: "Campus Life Archive 2", imageUrl: "/uploads/SaveClip.App_639565682_17874208830540340_8562496141950537581_n.jpg", category: "archives" },
  { title: "Campus Life Archive 3", imageUrl: "/uploads/SaveClip.App_639737274_17874209076540340_1716945594309676826_n.jpg", category: "archives" },
  { title: "Campus Life Archive 4", imageUrl: "/uploads/SaveClip.App_639821708_17874209067540340_5938461671048105761_n.jpg", category: "archives" },
  { title: "Campus Life Archive 5", imageUrl: "/uploads/SaveClip.App_639878129_17874208848540340_4252734993986022359_n.jpg", category: "archives" },
  { title: "Campus Life Archive 6", imageUrl: "/uploads/SaveClip.App_640333399_17874208839540340_4962223456113642673_n.jpg", category: "archives" },
  { title: "Campus Life Archive 7", imageUrl: "/uploads/SaveClip.App_640384013_17874208821540340_7435594315025521625_n.jpg", category: "archives" },
  { title: "Campus Life Archive 8", imageUrl: "/uploads/SaveClip.App_640390030_17874209058540340_2588373548793483610_n.jpg", category: "archives" },
  { title: "Campus Life Archive 9", imageUrl: "/uploads/SaveClip.App_645805710_17875166187540340_8079738812487824061_n.jpg", category: "archives" },
  { title: "Campus Life Archive 10", imageUrl: "/uploads/SaveClip.App_645816342_17875166199540340_2428150000072121285_n.jpg", category: "archives" },
  { title: "Campus Life Archive 11", imageUrl: "/uploads/SaveClip.App_645856700_17875166166540340_4998815109009318139_n.jpg", category: "archives" },
  { title: "Campus Life Archive 12", imageUrl: "/uploads/SaveClip.App_645959303_17875166208540340_3360601696398994524_n.jpg", category: "archives" },
  { title: "Campus Life Archive 13", imageUrl: "/uploads/SaveClip.App_645967355_17875166175540340_7345226014601707019_n.jpg", category: "archives" },
  { title: "Campus Life Archive 14", imageUrl: "/uploads/1772086140449.HEIC", category: "archives" },
];

const restoreData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for restoration...");

    // 1. Inject hardcoded archives
    for (const data of archivePhotos) {
      const exists = await Photo.findOne({ imageUrl: data.imageUrl });
      if (!exists) {
        await Photo.create(data);
        console.log(`Restored Archive: ${data.title}`);
      } else {
        await Photo.updateOne({ imageUrl: data.imageUrl }, { category: "archives" });
      }
    }

    // 2. Scan server/uploads and client/uploads
    const uploadDirs = [
      path.join(__dirname, "server", "uploads"),
      path.join(__dirname, "server", "uploads", "gallery"),
      path.join(__dirname, "server", "uploads", "photography"),
      path.join(__dirname, "client", "uploads"),
    ];

    for (const dir of uploadDirs) {
      if (!fs.existsSync(dir)) continue;
      console.log(`Scanning ${dir}...`);
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) continue;

        const ext = path.extname(file).toLowerCase();
        const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
        const isVideo = [".mp4", ".mov", ".webm"].includes(ext);

        if (!isImage && !isVideo) continue;

        // Construct relative URL
        let imageUrl;
        if (dir.includes("server")) {
          imageUrl = dir.includes("gallery") ? `/uploads/gallery/${file}` : 
                     dir.includes("photography") ? `/uploads/photography/${file}` : 
                     `/uploads/${file}`;
        } else {
          imageUrl = `/uploads/${file}`;
        }

        const exists = await Photo.findOne({ imageUrl });
        
        // Determine category
        let category = "photography";
        if (isVideo) category = "videography";

        const fileName = file.toLowerCase();
        if (fileName.includes("achievement")) {
          category = "achievements";
        } else if (fileName.includes("reel") || fileName.includes("short") || fileName.includes("saveclip.app")) {
          category = "reels";
        } else if (fileName.includes("bts") || fileName.includes("behind") || fileName.includes("team") || fileName.includes("crew")) {
          category = "team-bts";
        } else if (fileName.includes("sport") || fileName.includes("match") || fileName.includes("game") || fileName.includes("play") || /img_10\d\d/.test(fileName)) {
          category = "sports";
        } else if (fileName.includes("vistoso") || fileName.includes("jasmine")) {
          category = "vistoso";
        } else if (fileName.includes("archive") || fileName.includes("campus")) {
          category = "archives";
        }

        if (!exists) {
          await Photo.create({
            title: file.split(".")[0].replace(/_/g, " ").replace(/-/g, " "),
            imageUrl,
            type: isVideo ? "video" : "image",
            category
          });
          console.log(`Added missing: ${file} -> ${category}`);
        } else {
          // Update category if it's currently 'archive' or 'photography' (default)
          if (exists.category === "archive" || exists.category === "photography") {
            await Photo.updateOne({ _id: exists._id }, { category });
            console.log(`Updated category: ${file} -> ${category}`);
          }
        }
      }
    }

    // 3. Heuristic update for existing Cloudinary items
    const allPhotos = await Photo.find({});
    for (const p of allPhotos) {
      let newCat = p.category;
      const title = p.title.toLowerCase();
      
      if (title.includes("achievement")) newCat = "achievements";
      else if (title.includes("reel") || title.includes("social") || title.includes("tiktok")) newCat = "reels";
      else if (title.includes("bts") || title.includes("behind") || title.includes("crew")) newCat = "team-bts";
      else if (title.includes("sport") || title.includes("match") || title.includes("game")) newCat = "sports";
      else if (title.includes("vistoso") || title.includes("jasmine")) newCat = "vistoso";
      
      if (newCat !== p.category) {
        await Photo.updateOne({ _id: p._id }, { category: newCat });
        console.log(`Matched Title: ${p.title} -> ${newCat}`);
      }
    }

    console.log("Restoration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Restoration failed:", err);
    process.exit(1);
  }
};

restoreData();
