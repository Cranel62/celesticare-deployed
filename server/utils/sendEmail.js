const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const requiredEmailConfig = [
    'BREVO_SMTP_HOST',
    'BREVO_SMTP_USER',
    'BREVO_SMTP_PASS',
    'FROM_NAME',
    'FROM_EMAIL',
  ];
  const missingConfig = requiredEmailConfig.filter((key) => !process.env[key]);
  if (missingConfig.length > 0) {
    throw new Error(`Email configuration is incomplete: ${missingConfig.join(', ')}`);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: Number(process.env.BREVO_SMTP_PORT) === 465,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
