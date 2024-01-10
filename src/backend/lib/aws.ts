import aws from "aws-sdk";

const REGION = process.env.S3_UPLOAD_REGION;

aws.config.update({
  accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.APP_AWS_ACCESS_KEY_SECRET,
  region: REGION,
  signatureVersion: "v4",
});

const s3 = new aws.S3({
  region: REGION,
});

export { s3 };
