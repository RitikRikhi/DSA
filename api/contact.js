const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Simple inquiry schema
const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  purpose: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Cache connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  if (mongoose.connection.readyState === 1) {
    cachedDb = mongoose.connection;
    return cachedDb;
  }
  
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI');
  
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
  
  cachedDb = mongoose.connection;
  return cachedDb;
}

module.exports = async function handler(req, res) {
  // CORS setup just in case
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, purpose, message } = req.body;

  if (!name || !email || !purpose || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    console.log("Started Vercel Serverless Function for /api/contact");
    // Connect to MongoDB
    await connectToDatabase();
    
    // Register the model securely
    const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);

    // Save to database
    const newInquiry = new Inquiry({ name, email, purpose, message });
    await newInquiry.save();
    console.log("Inquiry saved to MongoDB.");

    // Send email
    console.log("Attempting to send email via SMTP 587...");
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // upgrades to TLS
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: `New Inquiry: ${purpose} - ${name}`,
        html: `
        <h3>New Inquiry Submitted</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return res.status(201).json({ status: "success", message: "Inquiry sent." });
  } catch (error) {
    console.error("API Route Error:", error);
    return res.status(500).json({ status: "error", message: error.message || "Failed to process inquiry" });
  }
}
