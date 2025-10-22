const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // use 587 for TLS
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs, prevents TLS hang
  },
  connectionTimeout: 10000, // 10 seconds
});

module.exports = async (to, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Verify your email</h2>
      <p>Hello 👋,</p>
      <p>Thanks for signing up! Use the verification code below to confirm your email address:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #111; letter-spacing: 4px;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="font-size: 12px; color: #666;">If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Verification Code",
    html,
  });
};

