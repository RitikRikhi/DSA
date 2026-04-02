const express = require("express");
const router = express.Router();
const Inquiry = require("../models/inquiry");
const nodemailer = require("nodemailer");

// After (More robust for Render)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  // Force IPv4 for Render network compatibility
  family: 4, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // This setting ensures that even if there's a certificate issue on the cloud server, it still connects.
    rejectUnauthorized: false
  }
});

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

router.post("/", catchAsync(async (req, res, next) => {
    console.log('--- Incoming Contact Form Request ---');
    console.log('Origin:', req.headers.origin);
    console.log('Body:', req.body);
    const { name, email, purpose, message } = req.body;

    if (!name || !email || !purpose || !message) {
      return next(new AppError("All fields are required", 400));
    }

    const newInquiry = new Inquiry({
      name,
      email,
      purpose,
      message
    });

    await newInquiry.save();

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send it to the mcrewdsa email
      subject: `New Contact Form Inquiry: ${purpose}`,
      html: `
        <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #ff3030;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px;">
              <span style="color: #ff3030;">DSA</span><span style="color: #ffd700; margin: 0 4px;">·</span><span style="color: #ffffff;">MEDIA CREW</span>
            </h1>
            <p style="color: #ffd700; margin: 10px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Website Inquiry</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 40px 30px; background-color: #111111;">
            
            <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ff3030; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333333; width: 100px;"><strong style="color: #888888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Name:</strong></td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333333; color: #ffffff; font-size: 16px; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333333;"><strong style="color: #888888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Email:</strong></td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333333;"><a href="mailto:${email}" style="color: #ffd700; text-decoration: none; font-size: 16px; transition: color 0.3s;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;"><strong style="color: #888888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Purpose:</strong></td>
                  <td style="padding: 12px 0;">
                    <span style="background: rgba(255, 48, 48, 0.15); color: #ff3030; border: 1px solid rgba(255, 48, 48, 0.3); padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">${purpose}</span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 15px; font-size: 15px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #333333; padding-bottom: 10px; display: inline-block;">Message Details</h3>
              <div style="background-color: #161616; border: 1px solid #222222; padding: 25px; border-radius: 8px; color: #dddddd; line-height: 1.8; white-space: pre-wrap; font-size: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">${message}</div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background-color: #050505; text-align: center; padding: 25px; border-top: 1px solid #222222;">
            <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
              This is an automated notification from the DSA Media Crew website.
              <br>To respond, simply reply to this email to reach out to <strong style="color: #ffd700;">${email}</strong> directly.
            </p>
          </div>
          
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("--- SMTP ERROR ---");
        console.error("Code:", error.code);
        console.error("Command:", error.command);
        console.error("Full Error:", error);
      } else {
        console.log("--- SMTP SUCCESS ---");
        console.log("Accepted:", info.accepted);
        console.log("Response:", info.response);
      }
    });

    // Submit to Google Form if configured
    if (process.env.GOOGLE_FORM_URL) {
      try {
        const formData = new URLSearchParams();
        formData.append(process.env.GOOGLE_FORM_ENTRY_NAME || 'entry.1', name);
        formData.append(process.env.GOOGLE_FORM_ENTRY_EMAIL || 'entry.2', email);
        formData.append(process.env.GOOGLE_FORM_ENTRY_PURPOSE || 'entry.3', purpose);
        formData.append(process.env.GOOGLE_FORM_ENTRY_MESSAGE || 'entry.4', message);

        await fetch(process.env.GOOGLE_FORM_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log("Google Form submission dispatched successfully.");
      } catch (gFormError) {
        console.error("Error submitting to Google Form:", gFormError);
      }
    }

    res.status(201).json({ message: "Inquiry submitted successfully", inquiry: newInquiry });
}));

// Diagnostic endpoint for testing email configuration
router.get("/test-email", catchAsync(async (req, res) => {
  console.log("--- Manual Email Test Triggered ---");
  const testMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "DSA Media Crew: Email Transporter Diagnostic",
    text: "If you receive this, your SMTP configuration (Gmail App Password) is working correctly on this server."
  };

  try {
    const info = await transporter.sendMail(testMailOptions);
    console.log("Diagnostic email sent:", info.response);
    res.json({ status: "Success", details: info.response });
  } catch (error) {
    console.error("DIAGNOSTIC ERROR: Transporter failed:", error);
    res.status(500).json({ 
      status: "Failed", 
      message: error.message,
      code: error.code,
      command: error.command
    });
  }
}));

module.exports = router;
