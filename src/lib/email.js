import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email, verificationToken) {
  // Configure your email transporter (replace with your actual email service)
  const transporter = nodemailer.createTransport({
    host: 'smtp.your-email-service.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

  // Email content
  const mailOptions = {
    from: '"StockAI" <noreply@stockai.com>',
    to: email,
    subject: 'Verify Your StockAI Account',
    html: `
      <h1>Welcome to StockAI!</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
