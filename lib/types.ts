export type UserRole = "user" | "supervisor" | "admin";

export type AuthSource = "supabase" | "adminpanel";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  title?: string;
  emailVerified: boolean;
  createdAt: string;
  password?: string;
  profession?: string;
  experienceYears?: number;
  license?: string;
  isSuperAdmin?: boolean;
  scopes?: string[];
  authSource?: AuthSource;
}

/** Giriş sonrası API (/api/auth/me, /api/auth/sync) dönüş tipi */
export type SessionUser = User & {
  scopes: string[];
  authSource: AuthSource;
};

export interface Supervisor {
  id: string;
  userId?: string;
  fullName: string;
  title: string;
  photo: string;
  bio: string;
  expertise: string[];
  pricePerSession: number;
  currency: "TRY" | "USD" | "EUR";
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  license: string;
  languages: string[];
  approaches: string[];
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  supervisorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export type AppointmentStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface Appointment {
  id: string;
  supervisorId: string;
  supervisorName: string;
  superviseeId?: string;
  superviseeName: string;
  superviseeEmail: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  meetLink?: string;
  paymentApproved: boolean;
  amount: number;
  notes?: string;
  createdAt: string;
}

export type ServiceType =
  | "individual"
  | "group"
  | "peer"
  | "simulation";

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  icon: string;
  price: number;
  duration: number;
  active: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  published: boolean;
}

export interface Review {
  id: string;
  supervisorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SupervisorInvite {
  id: string;
  token: string;
  email: string;
  invitedAt: string;
  acceptedAt?: string;
  status: "pending" | "accepted" | "expired";
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  socials: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}
