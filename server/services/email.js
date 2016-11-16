import nodemailer from 'nodemailer';
import config from '../../config/env';

const emailUser = config.email.user;
const emailPass = config.email.pass;

const transporter = nodemailer.createTransport(`smtps://${emailUser}:${emailPass}@smtp.gmail.com`);

function generateMailOptions(ticket, user, device) {
  return {
    from: `"Escalator" <${emailUser}>`,
    to: `"${user.name}" <${device.contactInformation}>`,
    subject: `🐴 ${ticket.metadata.title} 🐴`,
    text: `${ticket.metadata.body}`,
    html: `${ticket.metadata.body}`
  };
}

function sendEmail(ticket, user, device) {
  const mailOptions = generateMailOptions(ticket, user, device);
  return transporter.sendMail(mailOptions);
}

export default {
  sendEmail
};
