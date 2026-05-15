"use client";

import Link from "next/link";
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  Clock as ClockIcon,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const appointments = useAppStore((s) => s.appointments);
  const users = useAppStore((s) => s.users);
  const supervisors = useAppStore((s) => s.supervisors);
  const contactMessages = useAppStore((s) => s.contactMessages);

  const totalRevenue = appointments
    .filter((a) => a.paymentApproved)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingPayments = appointments.filter((a) => !a.paymentApproved).length;

  const recentAppointments = [...appointments]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
         <h1 className="h2-premium text-3xl">Genel Bakış</h1>
         <div className="text-xs font-bold text-clinical-muted uppercase tracking-widest">
            Son Güncelleme: {new Date().toLocaleTimeString()}
         </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          title="Toplam Gelir"
          value={formatPrice(totalRevenue)}
          icon={CreditCard}
          trend="+12%"
          color="navy"
        />
        <StatCard
          title="Toplam Kullanıcı"
          value={users.length}
          icon={Users}
          trend="+5%"
          color="navy"
        />
        <StatCard
          title="Aktif Süpervizör"
          value={supervisors.length}
          icon={TrendingUp}
          color="navy"
        />
        <StatCard
          title="Bekleyen Ödeme"
          value={pendingPayments}
          icon={Calendar}
          color="amber"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="card-premium">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-navy-900 uppercase tracking-widest text-xs">Son Randevular</h2>
              <Link href="/admin/randevular" className="text-xs font-bold text-navy-500 hover:text-navy-900 transition-colors">
                Tümünü Gör
              </Link>
            </div>
            <div className="divide-y divide-clinical-border">
              {recentAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-4 group">
                  <div>
                    <div className="text-sm font-bold text-navy-900">{a.superviseeName}</div>
                    <div className="text-[10px] text-clinical-muted uppercase font-bold tracking-widest mt-1">
                      {a.supervisorName} • {formatDate(a.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-navy-900">{formatPrice(a.amount)}</div>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="card-premium bg-navy-900 text-white border-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-premium flex items-center justify-center">
                 <Mail className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Yeni Mesajlar</h3>
            </div>
            <div className="text-4xl font-display font-bold mb-2">
              {contactMessages.filter((m) => !m.read).length}
            </div>
            <p className="text-navy-400 text-xs mb-6">Okunmamış iletişim mesajı bulunuyor.</p>
            <Link href="/admin/mesajlar" className="btn-white w-full text-xs py-2">Mesajları Oku</Link>
          </div>

          <div className="card-premium">
             <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-6">Sistem Özeti</h3>
             <div className="space-y-6">
                <SummaryItem icon={CheckCircle2} label="Onaylı Randevu" value={appointments.filter(a => a.status === 'confirmed').length} />
                <SummaryItem icon={ClockIcon} label="Bekleyen Onay" value={appointments.filter(a => a.status === 'pending_payment').length} />
                <SummaryItem icon={TrendingUp} label="Tamamlanan" value={appointments.filter(a => a.status === 'completed').length} />
             </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    navy: "bg-navy-900 text-white",
    amber: "bg-amber-500 text-white",
  };
  return (
    <div className={`card-premium ${colors[color] || "bg-white"} border-none shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-6 w-6 ${color ? "text-white/70" : "text-navy-400"}`} />
        {trend && <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="text-3xl font-display font-bold mb-1">{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${color ? "text-white/60" : "text-clinical-muted"}`}>{title}</div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }: any) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-navy-400" />
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-widest">{label}</span>
         </div>
         <span className="font-bold text-navy-900">{value}</span>
      </div>
   )
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending_payment: { label: "Ödeme Bekliyor", cls: "bg-amber-50 text-amber-700 border-amber-100" },
    confirmed: { label: "Onaylı", cls: "bg-green-50 text-green-700 border-green-100" },
    completed: { label: "Tamamlandı", cls: "bg-navy-50 text-navy-700 border-navy-100" },
    cancelled: { label: "İptal", cls: "border-black/15 bg-[#f1f0f0] text-black" },
  };
  const s = map[status] ?? { label: status, cls: "bg-clinical-light text-clinical-muted border-clinical-border" };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${s.cls}`}>
      {s.label}
    </span>
  );
}
