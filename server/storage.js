import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const minioHost = process.env.MINIO_ENDPOINT || (process.env.NODE_ENV === 'production' ? 'alo-minio' : '127.0.0.1');
const minioPort = process.env.MINIO_PORT || '9000';
// No built-in storage credentials: a hardcoded key silently talks to the wrong
// bucket or fails with a misleading auth error. Missing credentials fall back to
// local disk, which is already the documented degraded path.
const accessKeyId = process.env.MINIO_ROOT_USER || '';
const secretAccessKey = process.env.MINIO_ROOT_PASSWORD || '';
const BUCKET_NAME = process.env.MINIO_BUCKET || 'alodoctor-assets';

export const s3 = new S3Client({
  endpoint: `http://${minioHost}:${minioPort}`,
  region: 'us-east-1',
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

let isMinioAvailable = false;

export async function initStorage() {
  if (!accessKeyId || !secretAccessKey) {
    isMinioAvailable = false;
    console.warn('⚠️ MinIO credentials not configured (MINIO_ROOT_USER / MINIO_ROOT_PASSWORD). Files will be stored on local disk.');
    return;
  }
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    isMinioAvailable = true;
    console.log(`✅ MinIO connected, bucket '${BUCKET_NAME}' ready.`);
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      isMinioAvailable = true;
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' created.`);
    } catch (createErr) {
      isMinioAvailable = false;
      console.warn('⚠️ MinIO unavailable, operating with local disk storage:', createErr?.message || createErr);
    }
  }
}

export async function saveFile(key, buffer, contentType) {
  if (isMinioAvailable) {
    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));
      return { success: true, key, storage: 'minio' };
    } catch (e) {
      console.warn('MinIO upload failed, saving to local disk:', e.message);
    }
  }
  const filePath = path.join(uploadsDir, key);
  fs.writeFileSync(filePath, buffer);
  return { success: true, key, storage: 'disk' };
}

export async function getFile(key) {
  if (isMinioAvailable) {
    try {
      const response = await s3.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }));
      return { stream: response.Body, contentType: response.ContentType };
    } catch (e) {
      console.warn('MinIO read failed, reading from local disk:', e.message);
    }
  }
  const filePath = path.join(uploadsDir, key);
  if (fs.existsSync(filePath)) {
    return { stream: fs.createReadStream(filePath), contentType: 'application/octet-stream' };
  }
  return null;
}
