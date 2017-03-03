export default {
  env: 'production',
  db: process.env.DB_URI,
  port: process.env.PORT || 3000,
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    queueSecret: process.env.QUEUE_SECRET
  },
  default_delay: 10,
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  twilio: {
    accountSid: process.env.PHONE_SID,
    token: process.env.PHONE_TOKEN,
    fromPhone: '+15854818574'
  }
};
