import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.AWS_ENDPOINT || undefined,
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
});

export const uploadVideoToS3 = async (file, folder = 'videos') => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',           // Change to 'private' if you want signed URLs
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return {
      success: true,
      url: fileUrl,
      key: fileName,
      platform: 's3'
    };

  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload video to S3');
  }
};

// Optional: For multiple videos
export const uploadMultipleVideos = async (files, folder = 'videos') => {
  const uploadPromises = files.map(file => uploadVideoToS3(file, folder));
  return Promise.all(uploadPromises);
};