const nodemailer = require('nodemailer');

let transporter;

const sendEmail = async (options) => {
  const requiredEmailConfig = [
    'BREVO_SMTP_HOST',
    'BREVO_SMTP_USER',
    'BREVO_SMTP_PASS',
    'FROM_NAME',
    'FROM_EMAIL',
  ];
  const missingConfig = requiredEmailConfig.filter((key) => !String(process.env[key] || '').trim());
  if (missingConfig.length > 0) {
    throw new Error(`Email configuration is incomplete: ${missingConfig.join(', ')}`);
  }

  if (!transporter) {
    const port = Number(process.env.BREVO_SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: String(process.env.BREVO_SMTP_HOST).trim(),
      port,
      secure: port === 465,
      requireTLS: port === 587,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: String(process.env.BREVO_SMTP_USER).trim(),
        pass: String(process.env.BREVO_SMTP_PASS).trim(),
      },
    });
  }

  const mailOptions = {
    from: `"${String(process.env.FROM_NAME).trim()}" <${String(process.env.FROM_EMAIL).trim()}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
