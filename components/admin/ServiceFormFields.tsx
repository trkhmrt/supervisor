import type { ServiceFormData } from "@/lib/services/form";

type ServiceFormFieldsProps = {
  form: ServiceFormData;
  setForm: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  showActive?: boolean;
};

export function ServiceFormFields({ form, setForm, showActive = false }: ServiceFormFieldsProps) {
  return (
    <>
      <input
        required
        placeholder="Hizmet adı"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Slug (boşsa addan üretilir)"
        value={form.slug}
        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <input
        required
        placeholder="Kısa açıklama"
        value={form.shortDescription}
        onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
        className="md:col-span-2 rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <textarea
        required
        placeholder="Uzun açıklama"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        className="md:col-span-2 h-28 resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <textarea
        required
        placeholder="Özellikler (her satır bir madde)"
        value={form.features}
        onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
        className="md:col-span-2 h-24 resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <select
        value={form.icon}
        onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
        className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
      >
        <option value="user">Bireysel (user)</option>
        <option value="users">Grup (users)</option>
        <option value="handshake">Akran (handshake)</option>
        <option value="stage">Simülasyon (stage)</option>
      </select>
      <input
        type="number"
        min={1}
        placeholder="Süre (dakika)"
        value={form.duration}
        onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
        className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <input
        type="number"
        min={0}
        placeholder="Fiyat (TRY)"
        value={form.price}
        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-3 rounded-premium border border-clinical-border px-4 py-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.isGroupService}
          onChange={(e) => setForm((f) => ({ ...f, isGroupService: e.target.checked }))}
          className="h-4 w-4"
        />
        <span>
          <span className="font-semibold text-navy-900">Grup hizmeti</span>
          <span className="block text-xs text-clinical-muted mt-0.5">
            Süpervizörler bu hizmet için grup/kohort tanımlayabilir.
          </span>
        </span>
      </label>
      {showActive && (
        <label className="flex items-center gap-3 rounded-premium border border-clinical-border px-4 py-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="h-4 w-4"
          />
          <span className="font-semibold text-navy-900">Aktif (sitede görünsün)</span>
        </label>
      )}
    </>
  );
}
