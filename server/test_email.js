const dotenv = require('dotenv');
const path = require('path');
const sendEmail = require('./utils/emailService');

// Load env vars specifically from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
        console.error('ERROR: Please set EMAIL_USER in server/.env');
        return;
    }
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_email_password') {
        console.error('ERROR: Please set EMAIL_PASS in server/.env');
        return;
    }

    console.log(`Sending test email to ${process.env.EMAIL_USER}...`);

    try {
        await sendEmail({
            email: process.env.EMAIL_USER,
            subject: 'DevTrack - Email Configuration Test',
            message: 'Congratulations! Your DevTrack email service is working correctly.\n\nYou will now receive daily goal reminders and completion notifications.',
        });
        console.log('SUCCESS: Test email sent! Check your inbox.');
    } catch (err) {
        console.error('FAILED to send email:', err.message);
        console.log('\nTroubleshooting Tips:');
        console.log('1. Ensure you are using a Gmail App Password, NOT your regular password.');
        console.log('2. Check that 2-Step Verification is enabled on your Google Account.');
        console.log('3. Verify that the EMAIL_USER and EMAIL_PASS are correct in your .env file.');
    }
};

testEmail();
