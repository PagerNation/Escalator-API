export default {
  env: 'production',
  db: process.env.DB_URI,
  port: process.env.PORT || 3000,
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    queueSecret: process.env.QUEUE_SECRET
  },
  defaultDelay: 10,
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  twilio: {
    accountSid: process.env.PHONE_SID,
    token: process.env.PHONE_TOKEN,
    fromPhone: '+15854818574'
  },
  queuePath: process.env.QUEUE_PATH,
  queueHost: `${process.env.QUEUE_HOST}:${process.env.QUEUE_PORT}`,
  defaultTicketQueryLimit: 10,
  maximumTicketQueryLimit: 20
};
