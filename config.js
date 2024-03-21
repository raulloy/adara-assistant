import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 5000,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ASST_API_KEY: process.env.ASST_API_KEY,
  ASSISTANT_ID: process.env.ASSISTANT_ID,
  HUBSPOT_ACCESS_TOKEN: process.env.HUBSPOT_ACCESS_TOKEN,
};
