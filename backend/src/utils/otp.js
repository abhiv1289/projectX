import crypto from "crypto";
import Brevo from "@getbrevo/brevo";

// Initialize Brevo client
const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP
export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// Send OTP via Brevo
export const sendOTPEmail = async (email, otp) => {
  try {
    const sendSmtpEmail = {
      sender: { name: "ProjectX", email: "abhiv123.av@gmail.com" }, // or your verified sender
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2>🔐 ProjectX OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    };

    const response = await brevo.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ OTP email sent to ${email}`, response);
  } catch (error) {
    console.error("❌ Error sending OTP via Brevo:", error);
    throw new Error("Failed to send OTP email");
  }
};
