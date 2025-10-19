import crypto from "crypto";
import nodemailer from "nodemailer";

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP
export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// Send OTP via email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // SSL
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // 16-char App Password
      },
    });

    // Email options
    const mailOptions = {
      from: `"ProjectX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};
