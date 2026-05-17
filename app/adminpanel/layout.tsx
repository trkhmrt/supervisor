import { AdminPanelShell } from "@/components/adminpanel/AdminPanelShell";

export const metadata = {
  title: "Admin Panel | Süpervizyon",
  robots: { index: false, follow: false },
};

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminPanelShell>{children}</AdminPanelShell>;
}
