import mongoose from 'mongoose';
import _env from '../../dotenv'; // eslint-disable-line no-unused-vars
import config from '../../config/env';
import seeder from './seed';

mongoose.Promise = Promise;

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

seeder.seedAll()
  .then(() => process.exit());
