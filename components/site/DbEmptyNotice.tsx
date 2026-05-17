/** Veritabanı listesi boş veya API hatası */
export function DbEmptyNotice({
  loading,
  error,
  emptyLabel = "Kayıt bulunamadı.",
}: {
  loading: boolean;
  error: string | null;
  emptyLabel?: string;
}) {
  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-clinical-muted">Veritabanından yükleniyor…</p>
    );
  }
  if (error) {
    return (
      <p className="rounded-premium border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
        {error}
      </p>
    );
  }
  return (
    <p className="py-12 text-center text-sm text-clinical-muted">{emptyLabel}</p>
  );
}
