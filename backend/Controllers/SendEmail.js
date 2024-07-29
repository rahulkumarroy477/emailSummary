require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = (email, token) => {
  const url = `http://localhost:8000/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER || 'rahulkumarroy477@gmail.com',
    to: email,
    subject: 'Verify your email address',
    text: `Click this link to verify your email address: ${url}`,
    html: `<p>Click this link to verify your email address: <a href="${url}">Verify Email</a></p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = sendVerificationEmail;
