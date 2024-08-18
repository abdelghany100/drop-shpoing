const nodemailer = require('nodemailer');

const sendEmail = ({ to, subject, text }) => {
  //Create a Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_EMAIL_PASSWORD.split('-').join(' '),
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  //Define email options (from, to, subject, text)
  const mailOps = {
    from: process.env.USER_EMAIL,
    to,
    subject,
    text,
  };
  transporter.sendMail(mailOps, function (err, info) {
    if (err) {
      console.error(err);
    }
  });
  //Send the email with nodemailer  => transporter.sendMail(mailOptions)
  return transporter.sendMail(mailOps);
};
// USER_EMAIL=abdelghanyayman2@gmail.com
// USER_EMAIL_PASSWORD=gheno2002
module.exports = sendEmail;
