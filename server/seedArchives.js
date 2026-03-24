require("dotenv").config();
const mongoose = require("mongoose");
const Photo = require("./models/Photo");

const archivePhotos = [
  {
    title: "Campus Life Archive 1",
    imageUrl: "/uploads/SaveClip.App_638858792_17874209091540340_5824892488756174883_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 2",
    imageUrl: "/uploads/SaveClip.App_639565682_17874208830540340_8562496141950537581_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 3",
    imageUrl: "/uploads/SaveClip.App_639737274_17874209076540340_1716945594309676826_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 4",
    imageUrl: "/uploads/SaveClip.App_639821708_17874209067540340_5938461671048105761_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 5",
    imageUrl: "/uploads/SaveClip.App_639878129_17874208848540340_4252734993986022359_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 6",
    imageUrl: "/uploads/SaveClip.App_640333399_17874208839540340_4962223456113642673_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 7",
    imageUrl: "/uploads/SaveClip.App_640384013_17874208821540340_7435594315025521625_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 8",
    imageUrl: "/uploads/SaveClip.App_640390030_17874209058540340_2588373548793483610_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 9",
    imageUrl: "/uploads/SaveClip.App_645805710_17875166187540340_8079738812487824061_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 10",
    imageUrl: "/uploads/SaveClip.App_645816342_17875166199540340_2428150000072121285_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 11",
    imageUrl: "/uploads/SaveClip.App_645856700_17875166166540340_4998815109009318139_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 12",
    imageUrl: "/uploads/SaveClip.App_645959303_17875166208540340_3360601696398994524_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 13",
    imageUrl: "/uploads/SaveClip.App_645967355_17875166175540340_7345226014601707019_n.jpg",
    category: "archives"
  },
  {
    title: "Campus Life Archive 14",
    imageUrl: "/uploads/1772086140449.HEIC",
    category: "archives"
  }
];

const seedArchives = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for archive seeding...");

    // Optionally check if already seeded to avoid duplicates
    // const count = await Photo.countDocuments({ category: "archives" });
    // if (count > 0) {
    //   console.log("Archives already seeded. Skipping...");
    //   mongoose.connection.close();
    //   return;
    // }

    await Photo.insertMany(archivePhotos);
    console.log(`${archivePhotos.length} archive photos seeded successfully!`);
    
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error seeding archives:", error);
    process.exit(1);
  }
};

seedArchives();
