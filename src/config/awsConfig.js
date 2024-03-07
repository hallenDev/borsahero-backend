import dotenv from "dotenv";

dotenv.config();

export const config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // region: process.env.AWS_REGION,
  // bucket: process.env.AWS_BUCKET
};
