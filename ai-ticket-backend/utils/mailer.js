import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  // later html can also be added as parameter
  try {
    // create tranportor
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST || "smtp.ethereal.email",
      port: process.env.MAILTRAP_SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports || production -> should be true
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Vivek Kumar" <maddison53@ethereal.email>',
      to,
      subject,
      text,
      // html: "<b>Hello world?</b>", // HTML body || add later
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌Error sending email:", error);
  }
};
