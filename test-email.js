require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Render SMTP Test',
            text: 'If you see this, port 587 works.'
        });
        console.log('Email sent:', info.response);
    } catch (err) {
        console.error('Error sending email:', err.message);
    }
}

testEmail();
