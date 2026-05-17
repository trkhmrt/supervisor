import { PanelShell } from "@/components/panel/PanelShell";

export default function PanelimLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
