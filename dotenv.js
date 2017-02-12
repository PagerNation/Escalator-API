import fs from 'fs';
import dotenv from 'dotenv';

const environment = process.env.NODE_ENV || 'development';
const path = `.env.${environment}`;

try {
  const envConfig = dotenv.parse(fs.readFileSync(path));

  for (var k in envConfig) { // eslint-disable-line
    process.env[k] = envConfig[k];
  }
} catch (err) {
  console.warn('Env variables not loaded! ', err); //eslint-disable-line
}
