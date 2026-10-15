const nodemailer = require('nodemailer');

let transporter;

const sendViaBrevoApi = async ({ email, subject, html, text }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': String(process.env.BREVO_API_KEY).trim(),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: String(process.env.FROM_NAME).trim(),
        email: String(process.env.FROM_EMAIL).trim(),
      },
      to: [{ email }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(15000),
  });

  const responseBody = await response.text();
  let parsedBody;
  try {
    parsedBody = responseBody ? JSON.parse(responseBody) : {};
  } catch {
    parsedBody = { message: responseBody };
  }

  if (!response.ok) {
    const error = new Error(parsedBody.message || `Brevo API request failed with status ${response.status}`);
    error.code = 'BREVO_API_ERROR';
    error.responseCode = response.status;
    error.response = parsedBody;
    throw error;
  }

  return parsedBody;
};

const sendEmail = async (options) => {
  const requiredEmailConfig = [
    'FROM_NAME',
    'FROM_EMAIL',
  ];
  const missingConfig = requiredEmailConfig.filter((key) => !String(process.env[key] || '').trim());
  if (missingConfig.length > 0) {
    throw new Error(`Email configuration is incomplete: ${missingConfig.join(', ')}`);
  }

  const brevoApiKey = String(process.env.BREVO_API_KEY || '').trim();
  if (brevoApiKey) {
    if (brevoApiKey.startsWith('xsmtpsib-')) {
      throw new Error('BREVO_API_KEY contains an SMTP password. Create a separate Brevo API key starting with xkeysib-.');
    }

    return sendViaBrevoApi({
      email: String(options.email).trim().toLowerCase(),
      subject: options.subject,
      html: options.html,
      text: options.text || 'Please verify your CelestiCare account using the link in this email.',
    });
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('BREVO_API_KEY is required in production because Render Free blocks outbound SMTP ports.');
  }

  const smtpConfig = ['BREVO_SMTP_HOST', 'BREVO_SMTP_USER', 'BREVO_SMTP_PASS'];
  const missingSmtpConfig = smtpConfig.filter((key) => !String(process.env[key] || '').trim());
  if (missingSmtpConfig.length > 0) {
    throw new Error(`BREVO_API_KEY is required on Render. Missing SMTP fallback values: ${missingSmtpConfig.join(', ')}`);
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
    to: String(options.email).trim().toLowerCase(),
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
