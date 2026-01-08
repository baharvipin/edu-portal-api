const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. smtp.gmail.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // email
    pass: process.env.SMTP_PASS, // app password
  },
});

async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"School Admin" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
