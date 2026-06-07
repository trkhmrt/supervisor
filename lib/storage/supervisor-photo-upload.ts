import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import {
  SUPERVISOR_PHOTO_MAX_BYTES,
  SUPERVISOR_PHOTO_MIME,
} from "@/lib/storage/supervisor-photo-constants";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function extensionFor(file: File): string {
  const fromMime = EXT_BY_MIME[file.type];
  if (fromMime) return fromMime;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".png")) return ".png";
  if (lower.endsWith(".webp")) return ".webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return ".jpg";
  return ".jpg";
}

/** Blob pathname: supervisors/{supervisorId}/{uuid}.ext */
export function supervisorPhotoBlobPathname(supervisorId: string, filename: string): string {
  return `supervisors/${supervisorId}/${filename}`;
}

export function validateSupervisorPhotoFile(file: File): string | null {
  if (!SUPERVISOR_PHOTO_MIME.has(file.type)) {
    return "Yalnızca JPG, PNG veya WEBP yükleyebilirsiniz.";
  }
  if (file.size > SUPERVISOR_PHOTO_MAX_BYTES) {
    return "Fotoğraf en fazla 5 MB olabilir.";
  }
  if (file.size === 0) {
    return "Boş dosya yüklenemez.";
  }
  return null;
}

export async function uploadSupervisorPhotoFile(
  file: File,
  supervisorId: string
): Promise<string> {
  const id = supervisorId.trim();
  if (!id) throw new Error("Süpervizör kimliği gerekli.");

  const validationError = validateSupervisorPhotoFile(file);
  if (validationError) throw new Error(validationError);

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Blob depolama yapılandırılmamış. BLOB_READ_WRITE_TOKEN tanımlayın.");
  }

  const filename = `${randomUUID()}${extensionFor(file)}`;
  const pathname = supervisorPhotoBlobPathname(id, filename);

  const blob = await put(pathname, file, {
    access: "public",
    token,
    contentType: file.type,
    addRandomSuffix: false,
  });

  return blob.url;
}
