export default {
  env: 'development',
  db: 'mongodb://localhost/escalator-api-development',
  port: 3000,
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    queueSecret: process.env.QUEUE_SECRET
  },
  defaultDelay: 10,
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST
  },
  twilio: {
    accountSid: process.env.PHONE_SID,
    token: process.env.PHONE_TOKEN,
    fromPhone: process.env.PHONE_OUT
  },
  queuePath: process.env.QUEUE_PATH,
  queueHost: `${process.env.QUEUE_HOST}:${process.env.QUEUE_PORT}`,
  defaultTicketQueryLimit: 10,
  maximumTicketQueryLimit: 20
};
