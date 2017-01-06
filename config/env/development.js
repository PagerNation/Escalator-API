export default {
  env: 'development',
  db: 'mongodb://localhost/escalator-api-development',
  port: 3000,
  auth: {
    jwt_secret: process.env.JWT_SECRET
  },
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
