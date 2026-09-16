import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  dbBackend: process.env.DB_BACKEND || 'json',
  dataDir: process.env.DATA_DIR || './src/data',
};