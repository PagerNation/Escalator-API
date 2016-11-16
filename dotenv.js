import dotenv from 'dotenv';

const environment = process.env.NODE_ENV || 'development';
const path = `.env.${environment}`;

dotenv.config({ path, silent: environment === 'production' });
