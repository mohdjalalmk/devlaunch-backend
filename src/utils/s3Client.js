const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: "AKIAQJHF2UUNP4UGNZ7G",
    secretAccessKey: "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",
  },
});

module.exports = {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand 
};