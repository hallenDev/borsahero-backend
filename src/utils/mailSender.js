import AWS from "aws-sdk";

const SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-2",
};

AWS.config.update(SES_CONFIG);
const AWS_SES = new AWS.SES(SES_CONFIG);

export const sendMail = async (to, subject, text, html) => {
  try {
    let params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `${html}`,
          },
          Text: {
            Charset: "UTF-8",
            Data: `${html}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `${subject}`,
        },
      },
      Source: "hallendev0531@gmail.com",
      ReplyToAddresses: ["hallendev0531@gmail.com"],
    };

    const res = await AWS_SES.sendEmail(params).promise();
    return res;
  } catch (error) {
    console.log(error);
    return false;
  }
};
