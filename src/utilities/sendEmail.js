const brevo = require("@getbrevo/brevo");

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

module.exports = async (to, code) => {
  const htmlContent = `
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

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "WashLab Dashboard", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = "Your Verification Code";
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    console.log("📨 Sending via Brevo API...");
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully via Brevo:", data.messageId);
  } catch (error) {
    console.error("❌ Brevo API email send failed:", error.message);
    throw error;
  }
};
