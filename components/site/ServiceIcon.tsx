"use client";

import { User, Users, Handshake, Drama, BookOpen, GraduationCap } from "lucide-react";

export function ServiceIcon({ icon, className }: { icon: string; className?: string }) {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    user: User,
    users: Users,
    handshake: Handshake,
    stage: Drama,
    book: BookOpen,
    graduation: GraduationCap,
  };
  const C = map[icon] ?? User;
  return <C className={className} />;
}
