import { Storage } from '@google-cloud/storage';

const serviceAccountKey = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY!);

const storage = new Storage({
  projectId: serviceAccountKey.project_id,
  credentials: {
    client_email: serviceAccountKey.client_email,
    private_key: serviceAccountKey.private_key,
  },
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

/**
 * 버킷 전체 read로 설정
 */
export async function uploadToGcs(
  buffer: Buffer,
  destination: string,
  contentType: string,
): Promise<string> {
  await bucket.file(destination).save(buffer, { contentType });

  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}