type LearningOutcomesFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function LearningOutcomesField({ value, onChange, className }: LearningOutcomesFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
        Öğrenilecekler
      </label>
      <textarea
        placeholder="Her satıra bir madde yazın&#10;Örn: Vaka formülasyonu teknikleri&#10;Etik ve sınır yönetimi"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
      <p className="mt-1.5 text-xs text-clinical-muted">
        Site eğitim sayfasında madde madde listelenir.
      </p>
    </div>
  );
}
