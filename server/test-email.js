require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function testMailer() {
  try {
    console.log('Sending test email via Brevo relay...');
    const result = await sendEmail({
      email: 'marksoriano6501@gmail.com', // Sending to your own email to test
      subject: 'CelestiCare Brevo SMTP Test',
      html: '<h3>CelestiCare SMTP Test</h3><p>Your Brevo configuration is connected and active!</p>',
    });
    console.log('✅ Email sent successfully! Message ID:', result.messageId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Brevo SMTP dispatch error:', error);
    process.exit(1);
  }
}

testMailer();