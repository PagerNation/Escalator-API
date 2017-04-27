import nodemailer from 'nodemailer';
import config from '../../config/env';

const smtpConfig = {
  host: config.email.host,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

function generateMailOptions(ticket, user, device) {
  return {
    from: `"Escalator" <${config.email.user}>`,
    to: `"${user.name}" <${device.contactInformation}>`,
    subject: `🐴 ${ticket.metadata.title} 🐴`,
    text: `${ticket.metadata.description}`,
    html: `${ticket.metadata.description}`
  };
}

function sendEmail(ticket, user, device) {
  const mailOptions = generateMailOptions(ticket, user, device);
  return transporter.sendMail(mailOptions);
}

export default {
  sendEmail
};
