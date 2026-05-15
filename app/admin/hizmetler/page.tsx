"use client";

import { useState } from "react";
import { Layers, Plus, CheckCircle2, XCircle, MoreVertical, Edit2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { ServiceIcon } from "@/components/site/ServiceIcon";

export default function AdminServices() {
  const services = useAppStore((s) => s.services);
  const toggleService = useAppStore((s) => s.toggleService);

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
         <h1 className="h2-premium text-3xl">Hizmet Yönetimi</h1>
         <button className="btn-navy py-2 px-6 text-xs">
            <Plus className="h-4 w-4" /> Yeni Hizmet Ekle
         </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((s) => (
          <div key={s.id} className="card-premium group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-navy-50 rounded-premium flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-all duration-500">
                <ServiceIcon icon={s.icon} className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                   s.active ? "bg-green-50 text-green-700 border-green-100" : "bg-clinical-light text-clinical-muted border-clinical-border"
                 }`}>
                    {s.active ? "Aktif" : "Pasif"}
                 </span>
                 <button className="p-2 text-clinical-muted hover:text-navy-900">
                    <MoreVertical className="h-4 w-4" />
                 </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-navy-900 mb-2">{s.name}</h3>
            <p className="text-clinical-muted text-sm leading-relaxed mb-8 line-clamp-2">{s.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-clinical-border">
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted mb-1">Başlangıç Ücreti</div>
                  <div className="text-xl font-bold text-navy-900">{formatPrice(s.price)}</div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => toggleService(s.id)} className="btn-outline-navy py-2 px-4 text-[10px] uppercase font-bold tracking-widest">
                     {s.active ? "Pasif Yap" : "Aktif Et"}
                  </button>
                  <button className="p-2 bg-clinical-light text-navy-900 rounded-premium hover:bg-navy-900 hover:text-white transition-all">
                     <Edit2 className="h-4 w-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
