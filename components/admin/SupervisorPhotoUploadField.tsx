"use client";

import { useRef, useState } from "react";
import { Loader2, Pencil, User } from "lucide-react";
import { SUPERVISOR_PHOTO_MAX_BYTES } from "@/lib/storage/supervisor-photo-constants";

type Props = {
  supervisorId?: string | null;
  value: string;
  onChange: (url: string) => void;
  /** Oluşturma formu: kayıt sonrası yüklenecek dosya */
  onPendingFile?: (file: File | null) => void;
  disabled?: boolean;
  /** avatar: hover kalem + tıklayınca dosya seçici */
  variant?: "field" | "avatar";
};

export function SupervisorPhotoUploadField({
  supervisorId,
  value,
  onChange,
  onPendingFile,
  disabled,
  variant = "field",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function revokePreview(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function openFilePicker() {
    if (!disabled && !uploading) inputRef.current?.click();
  }

  async function handleFile(file: File) {
    if (file.size > SUPERVISOR_PHOTO_MAX_BYTES) {
      setError("Fotoğraf en fazla 5 MB olabilir.");
      return;
    }

    setError(null);

    if (previewUrl?.startsWith("blob:")) revokePreview(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    if (!supervisorId) {
      onPendingFile?.(file);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supervisorId", supervisorId);

      const res = await fetch("/api/upload/supervisor-photo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Fotoğraf yüklenemedi.");
        return;
      }

      onPendingFile?.(null);
      onChange(data.url);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = previewUrl ?? value;
  const sizeClass = variant === "avatar" ? "h-28 w-28" : "h-24 w-24";

  const photoButton = (
    <button
      type="button"
      onClick={openFilePicker}
      disabled={disabled || uploading}
      className={`group relative ${sizeClass} shrink-0 overflow-hidden rounded-full border border-clinical-border bg-clinical-light disabled:cursor-not-allowed ${
        variant === "avatar" ? "mx-auto block" : ""
      }`}
      title="Profil fotoğrafını değiştir"
      aria-label="Profil fotoğrafını değiştir"
    >
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-clinical-muted">
          <User className={variant === "avatar" ? "h-12 w-12" : "h-10 w-10"} />
        </div>
      )}

      {!uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/45 group-focus-visible:bg-black/45">
          <Pencil className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </span>
      )}

      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </span>
      )}
    </button>
  );

  return (
    <div className={variant === "avatar" ? "space-y-2" : "space-y-3"}>
      {variant === "field" && (
        <label className="block text-xs font-bold uppercase tracking-widest text-navy-900">
          Profil fotoğrafı
        </label>
      )}

      {variant === "avatar" ? (
        photoButton
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          {photoButton}
          <p className="min-w-0 flex-1 text-xs text-clinical-muted">
            Fotoğrafa tıklayın veya üzerine gelin · JPG, PNG, WEBP · en fazla 5 MB
            {!supervisorId && " · Kayıt sonrası yüklenecek"}
          </p>
        </div>
      )}

      {variant === "avatar" && error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}
      {variant === "field" && error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Kayıt oluşturulduktan sonra bekleyen fotoğrafı yükler */
export async function uploadPendingSupervisorPhoto(
  file: File,
  supervisorId: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("supervisorId", supervisorId);

  const res = await fetch("/api/upload/supervisor-photo", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Fotoğraf yüklenemedi.");
  }
  return data.url;
}
