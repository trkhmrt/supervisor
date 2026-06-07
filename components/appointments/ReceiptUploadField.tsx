"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { RECEIPT_MAX_BYTES } from "@/lib/storage/receipt-constants";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
};

export function ReceiptUploadField({ value, onChange, onError, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.size > RECEIPT_MAX_BYTES) {
      onError("Dosya boyutu en fazla 5 MB olabilir.");
      return;
    }

    setUploading(true);
    onError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/receipt", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onError(data.error ?? "Dekont yüklenemedi.");
        return;
      }

      setFileName(file.name);
      onChange(data.url);
    } catch {
      onError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange(null);
    setFileName(null);
    onError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
        <Upload className="h-3.5 w-3.5" />
        Ödeme dekontu *
      </label>
      <p className="text-xs text-clinical-muted leading-relaxed">
        Havale/EFT sonrası dekontunuzu yükleyin (JPG, PNG, WEBP veya PDF, en fazla 5 MB).
        Ödeme onaylandıktan sonra randevunuz aktif olur.
      </p>

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-premium border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-green-800 min-w-0">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate font-medium">{fileName ?? "Dekont yüklendi"}</span>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              className="shrink-0 rounded p-1 text-green-700 hover:bg-green-100"
              title="Kaldır"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-premium border-2 border-dashed border-clinical-border bg-white px-4 py-8 text-sm text-clinical-muted transition hover:border-navy-300 hover:bg-clinical-light disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
              Yükleniyor…
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-navy-400" />
              Dekont seçmek için tıklayın
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
