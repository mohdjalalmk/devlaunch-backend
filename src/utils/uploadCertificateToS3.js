const { s3, PutObjectCommand, GetObjectCommand } = require("./s3Client");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

const BUCKET_NAME = "devlaunch-certificate"

const uploadCertificateToS3 = async (buffer, userId, courseId) => {
  const fileName = `certificates/${userId}/${courseId}_${uuidv4()}.pdf`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: 'application/pdf',
  });

  await s3.send(command);

  return fileName
};

const generateSignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
  return signedUrl;
};

module.exports = { uploadCertificateToS3, generateSignedUrl };
