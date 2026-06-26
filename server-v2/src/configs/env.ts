import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  TYPESENSE: {
    enabled:  process.env.TYPESENSE_ENABLED !== 'false', // default: true, set 'false' untuk disable
    host:     process.env.TYPESENSE_HOST     || 'localhost',
    port:     parseInt(process.env.TYPESENSE_PORT || '8108'),
    protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    apiKey:   process.env.TYPESENSE_API_KEY  || 'xyz123',
  },
};