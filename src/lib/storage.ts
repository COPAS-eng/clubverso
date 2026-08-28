// Storage abstraction: MOCK (local /tmp) para dev/GH Pages, S3/R2 para prod
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const MOCK_DIR = path.join(process.cwd(), ".mock-storage");

function ensureMockDir() {
  if (!fs.existsSync(MOCK_DIR)) fs.mkdirSync(MOCK_DIR, { recursive: true });
}

export async function putObject(key: string, buffer: Buffer, contentType: string) {
  const provider = process.env.STORAGE_PROVIDER || "MOCK";
  if (provider === "MOCK") {
    ensureMockDir();
    const full = path.join(MOCK_DIR, key);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, buffer);
    return { key, url: `mock://${key}` };
  }
  // prod: usar @aws-sdk/client-s3
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: process.env.STORAGE_ACCESS_KEY_ID ? { accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!, secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY! } : undefined,
  });
  await client.send(new PutObjectCommand({ Bucket: process.env.STORAGE_BUCKET!, Key: key, Body: buffer, ContentType: contentType }));
  return { key, url: `s3://${key}` };
}

export async function getPresignedUrl(key: string, expiresSec = 900): Promise<string> {
  const provider = process.env.STORAGE_PROVIDER || "MOCK";
  if (provider === "MOCK") {
    // mock presigned: devolve /api/storage/mock?key=...
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return `${base.replace(/\/$/, "")}/api/storage/mock?key=${encodeURIComponent(key)}&expires=${expiresSec}&sig=${randomUUID().slice(0, 8)}`;
  }
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const client = new S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: process.env.STORAGE_ACCESS_KEY_ID ? { accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!, secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY! } : undefined,
  });
  return getSignedUrl(client, new GetObjectCommand({ Bucket: process.env.STORAGE_BUCKET!, Key: key }), { expiresIn: expiresSec });
}

export function getMockFilePath(key: string) {
  return path.join(MOCK_DIR, key);
}
