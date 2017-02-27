import mongoose from 'mongoose';
import _env from './dotenv'; // eslint-disable-line no-unused-vars
import config from './config/env';
import app from './config/express';
import groupLoader from './server/utils/groupLoader';

mongoose.Promise = Promise;

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

const debug = require('debug')('escalator-api:index');

groupLoader.bulkScheduleEPRotation();

// listen on port config.port
app.listen(config.port, () => {
  debug(`server started on port ${config.port} (${config.env})`);
});

export default app;
