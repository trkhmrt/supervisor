"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Calendar, User, Settings, LogOut, Video, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { Service } from "@/lib/types";
import { formatPrice, formatDate, serviceLabelById } from "@/lib/utils";
import { useRemoteServices } from "@/hooks/useRemoteServices";
import { AddSupervisorCard } from "@/components/panel/AddSupervisorCard";

export default function PanelimPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const storeServices = useAppStore((s) => s.services);
  const apiServices = useRemoteServices(storeServices);
  const servicesForLabels = useMemo(() => {
    const m = new Map(storeServices.map((s) => [s.id, s]));
    for (const s of apiServices) m.set(s.id, s);
    return Array.from(m.values());
  }, [storeServices, apiServices]);
  const appointments = useAppStore((s) =>
    s.appointments
      .filter((a) =>
        user?.role === "supervisor"
          ? a.supervisorName === user.fullName
          : a.superviseeId === user?.id
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  );

  useEffect(() => {
    if (!user) router.push("/giris");
  }, [user, router]);

  if (!user) return null;

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed"
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  return (
    <SiteShell>
      <section className="bg-navy-950 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
        <div className="container-wide relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <Reveal>
                <div className="flex items-center gap-2 text-navy-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                   <ShieldCheck className="h-4 w-4" />
                   Kullanıcı Paneli
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  Merhaba, <br />
                  <span className="text-navy-300">{user.fullName.split(" ")[0]}</span>
                </h1>
              </Reveal>
            </div>
            
            <Reveal delay={0.2}>
               <div className="flex gap-4">
                  <Link href="/panelim/profil" className="btn-white py-2 px-6 text-xs">
                     <Settings className="h-4 w-4" /> Profil Ayarları
                  </Link>
                  <button onClick={() => { logout(); router.push("/"); }} className="btn-outline-navy border-white text-white hover:bg-white/10 py-2 px-6 text-xs">
                     <LogOut className="h-4 w-4" /> Çıkış
                  </button>
               </div>
            </Reveal>
          </div>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <StaggerItem><StatCard icon={Calendar} label="Yaklaşan" value={upcoming.length} /></StaggerItem>
            <StaggerItem><StatCard icon={Clock} label="Geçmiş" value={past.length} /></StaggerItem>
            <StaggerItem>
              <StatCard
                icon={CreditCard}
                label="Bekleyen Ödeme"
                value={upcoming.filter((a) => !a.paymentApproved).length}
              />
            </StaggerItem>
            <StaggerItem><StatCard icon={User} label="Toplam" value={appointments.length} /></StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <section className="py-12 bg-clinical-light border-y border-clinical-border">
        <div className="container-wide max-w-3xl">
          <Reveal>
            <AddSupervisorCard user={user} />
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-16">
             <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-10">
                   <h2 className="h2-premium text-2xl">Yaklaşan Randevular</h2>
                   {user.role !== "supervisor" && (
                      <Link href="/supervizorler" className="text-sm font-bold text-navy-900 hover:text-accent-blue transition-colors">
                         + Yeni Randevu Al
                      </Link>
                   )}
                </div>

                {upcoming.length === 0 ? (
                  <div className="card-premium text-center py-16 bg-clinical-light border-dashed">
                    <p className="text-clinical-muted text-sm mb-8">Henüz planlanmış bir randevunuz bulunmuyor.</p>
                    {user.role !== "supervisor" && (
                      <Link href="/supervizorler" className="btn-navy">
                        Süpervizörleri İncele
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map((a) => (
                      <AppointmentRow
                        key={a.id}
                        appointment={a}
                        userRole={user.role}
                        servicesForLabels={servicesForLabels}
                      />
                    ))}
                  </div>
                )}

                {past.length > 0 && (
                  <div className="mt-20">
                    <h2 className="h2-premium text-2xl mb-10">Geçmiş Seanslar</h2>
                    <div className="space-y-4 opacity-70">
                      {past.map((a) => (
                        <AppointmentRow
                          key={a.id}
                          appointment={a}
                          userRole={user.role}
                          servicesForLabels={servicesForLabels}
                        />
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <div className="lg:col-span-4">
                <div className="sticky top-32 space-y-8">
                   <div className="card-premium bg-navy-900 text-white border-none">
                      <h3 className="text-lg font-bold mb-4">Klinik Destek</h3>
                      <p className="text-navy-300 text-xs leading-relaxed mb-6">
                         Randevularınızla ilgili bir sorun mu yaşıyorsunuz? 
                         Destek ekibimizle anında iletişime geçebilirsiniz.
                      </p>
                      <Link href="/iletisim" className="btn-white w-full text-xs">Destek Talebi Oluştur</Link>
                   </div>
                   
                   <div className="card-premium">
                      <h3 className="text-sm font-bold text-navy-900 mb-6 uppercase tracking-widest">Duyurular</h3>
                      <div className="space-y-6">
                         <AnnouncementItem title="Yeni Süpervizörler Katıldı" date="12 May 2026" />
                         <AnnouncementItem title="Grup Süpervizyonu Kayıtları Başladı" date="10 May 2026" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-premium">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/10 rounded-premium flex items-center justify-center">
           <Icon className="h-5 w-5 text-navy-300" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-400 mb-1">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  userRole,
  servicesForLabels,
}: {
  appointment: any;
  userRole: string;
  servicesForLabels: Service[];
}) {
  const cancel = useAppStore((s) => s.cancelAppointment);

  const statusLabel: Record<string, string> = {
    pending_payment: "Ödeme Bekliyor",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
    rescheduled: "Yeniden Planlandı",
  };
  
  const statusColor: Record<string, string> = {
    pending_payment: "bg-amber-50 text-amber-700 border-amber-100",
    confirmed: "bg-green-50 text-green-700 border-green-100",
    completed: "bg-navy-50 text-navy-700 border-navy-100",
    cancelled: "border-black/15 bg-[#f1f0f0] text-black",
    rescheduled: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="card-premium flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-navy-900">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${statusColor[appointment.status]}`}>
            {statusLabel[appointment.status]}
          </span>
          <span className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest">
            {serviceLabelById(servicesForLabels, appointment.serviceType)}
          </span>
        </div>
        <h4 className="text-lg font-bold text-navy-900 mb-2">
          {userRole === "supervisor" ? appointment.superviseeName : appointment.supervisorName}
        </h4>
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-clinical-muted uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-navy-400" />
            {formatDate(appointment.date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-navy-400" />
            {appointment.startTime} - {appointment.endTime}
          </div>
          <div className="text-navy-900">{formatPrice(appointment.amount)}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {appointment.meetLink && appointment.status === "confirmed" && (
          <a href={appointment.meetLink} target="_blank" rel="noreferrer" className="btn-navy py-2 px-5 text-xs">
            <Video className="h-4 w-4" /> Meet&apos;e Katıl
          </a>
        )}
        {(appointment.status === "pending_payment" || appointment.status === "confirmed") && (
          <button onClick={() => cancel(appointment.id)} className="btn-outline-navy py-2 px-5 text-xs">
            İptal Et
          </button>
        )}
      </div>
    </div>
  );
}

function AnnouncementItem({ title, date }: { title: string; date: string }) {
   return (
      <div className="group cursor-pointer">
         <div className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest mb-1">{date}</div>
         <h5 className="text-sm font-bold text-navy-900 group-hover:text-accent-blue transition-colors">{title}</h5>
      </div>
   )
}
