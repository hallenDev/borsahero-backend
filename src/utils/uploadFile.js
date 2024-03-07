import fs from "fs";
import AWS from "aws-sdk";
import { config } from "#root/config/awsConfig.js";

export const uploadFile = async (filename, path, originalname) => {
  try {
    AWS.config.update(config);
    const s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: process.env.AWS_REGION,
    });

    const fileContent = fs.readFileSync(path);
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `avatar/${filename}_${originalname}`,
      Body: fileContent,
      ACL: "public-read",
    };

    const file = await s3.upload(params).promise();
    fs.unlinkSync(path);
    return file;
  } catch (error) {
    return null;
  }
};
