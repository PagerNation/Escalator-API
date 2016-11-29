export default {
  env: 'production',
  db: process.env.DB_URI,
  port: process.env.PORT || 3000,
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
