import Str from "@supercharge/strings";
import { s3 } from "@/backend/lib/aws";

const PUBLIC_BUCKET = process.env.S3_UPLOAD_BUCKET;

export const uploadImageToS3 = async (image: string | undefined) => {
  if (!image) return;
  try {
    const response = await fetch(image);
    const buffer = await response
      .arrayBuffer()
      .then((buffer) => Buffer.from(buffer));

    const params = {
      Bucket: PUBLIC_BUCKET,
      Key: `user-content/${Str.uuid()}.png`,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: "image/png",
      ACL: "public-read",
    };

    const uploadResult = await s3.upload(params).promise();

    return uploadResult.Location;
  } catch (error) {
    console.log(error);
    return;
  }
};
