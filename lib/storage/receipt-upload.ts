import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { RECEIPT_MAX_BYTES } from "@/lib/storage/receipt-constants";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

function extensionFor(file: File): string {
  const fromMime = EXT_BY_MIME[file.type];
  if (fromMime) return fromMime;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return ".pdf";
  if (lower.endsWith(".png")) return ".png";
  if (lower.endsWith(".webp")) return ".webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return ".jpg";
  return ".bin";
}

/** Blob pathname: dekontlar/{userId}/{YYYY-MM-DD}/{id}.ext */
export function receiptBlobPathname(userId: number, filename: string): string {
  const dateFolder = new Date().toISOString().slice(0, 10);
  return `dekontlar/${userId}/${dateFolder}/${filename}`;
}

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Yalnızca JPG, PNG, WEBP veya PDF dosyası yükleyebilirsiniz.";
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return "Dosya boyutu en fazla 5 MB olabilir.";
  }
  if (file.size === 0) {
    return "Boş dosya yüklenemez.";
  }
  return null;
}

export async function uploadReceiptFile(file: File, userId: number): Promise<string> {
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error("Dekont yüklemek için giriş yapmalısınız.");
  }

  const validationError = validateReceiptFile(file);
  if (validationError) throw new Error(validationError);

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Blob depolama yapılandırılmamış. BLOB_READ_WRITE_TOKEN tanımlayın.");
  }

  const filename = `${randomUUID()}${extensionFor(file)}`;
  const pathname = receiptBlobPathname(userId, filename);

  const blob = await put(pathname, file, {
    access: "public",
    token,
    contentType: file.type,
    addRandomSuffix: false,
  });

  return blob.url;
}
