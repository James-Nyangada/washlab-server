const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT) || 465, // Use 465 for SSL
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP connection error:", error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
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

  try {
    console.log("📨 Sending email to:", to);
    const info = await transporter.sendMail({
      from: `"WashLab Dashboard" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Verification Code",
      html,
    });
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    throw err;
  }
};
