export type UserRole = "user" | "supervisor" | "admin";

export type AuthSource = "supabase" | "adminpanel";

export interface User {
  id: number;
  supabaseAuthId?: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  title?: string;
  emailVerified: boolean;
  createdAt: string;
  password?: string;
  phone?: string;
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
  userId?: number;
  fullName: string;
  title: string;
  photo: string;
  bio: string;
  expertise: string[];
  pricePerSession: number;
  sessionFeeOnRequest?: boolean;
  currency: "TRY" | "USD" | "EUR";
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  license?: string | null;
  languages: string[];
  approaches: string[];
  services?: Service[];
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  supervisorId: string;
  /** Gün (YYYY-MM-DD) — UI */
  date: string;
  startTime: string;
  endTime: string;
  /** ISO — veritabanı */
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}

/** Süpervizör takvim paneli — tek gün özeti */
export interface SupervisorCalendarDayView {
  date: string;
  /** Veritabanında açık kayıt; yoksa slotlardan çıkarılır */
  available: boolean | null;
  freeCount: number;
  bookedCount: number;
  slots: AvailabilitySlot[];
}

export interface SupervisorCalendarMonthResponse {
  year: number;
  month: number;
  days: SupervisorCalendarDayView[];
  defaultTimes: string[];
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
  userId?: number;
  superviseeName: string;
  superviseeEmail: string;
  superviseePhone: string;
  serviceType: string;
  serviceGroupId?: string;
  serviceGroupName?: string;
  date: string;
  startTime: string;
  endTime: string;
  startsAt: string;
  endsAt: string;
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
  isGroupService: boolean;
}

export interface ServiceGroup {
  id: string;
  supervisorId: string;
  serviceId: string;
  name: string;
  capacity: number;
  seatLabel?: string;
  sortOrder: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceGroupWithStats extends ServiceGroup {
  enrolledCount: number;
  remainingSeats: number;
  isFull: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  author: string;
  authorId?: string;
  authorSlug?: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  published: boolean;
}

export interface Author {
  id: string;
  slug: string;
  fullName: string;
  title?: string;
  bio: string;
  photo: string;
  supervisorId?: string;
  createdAt: string;
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
  expiresAt: string;
  acceptedAt?: string;
  status: "pending" | "accepted" | "expired";
  applicationId?: string | null;
  expired?: boolean;
}

export type SupervisorApplicationStatus = "pending" | "invited" | "rejected";

export interface SupervisorApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message?: string | null;
  status: SupervisorApplicationStatus;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export type CourseEnrollmentStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Course {
  id: string;
  supervisorId: string;
  title: string;
  slug: string;
  description: string;
  cover: string;
  active: boolean;
  acceptsApplications: boolean;
  maxParticipants?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  enrollmentCount?: number;
  pendingCount?: number;
}

/** Admin listesi — süpervizör adı ile */
export interface AdminCourse extends Course {
  supervisorName: string;
}

/** Admin eğitim detayı — başvurular dahil */
export interface AdminCourseDetail extends AdminCourse {
  enrollments: CourseEnrollment[];
}

export interface CourseInstructorProfile {
  id: string;
  fullName: string;
  title: string;
  photo: string;
  bio: string;
  yearsExperience: number;
  expertise: string[];
  rating: number;
  reviewCount: number;
}

/** Vitrin eğitim detayı */
export interface PublicCourseDetail extends AdminCourse {
  supervisorProfile: CourseInstructorProfile;
}

export interface SupervisorAdminCourseSummary {
  id: string;
  title: string;
  slug: string;
  active: boolean;
  acceptsApplications: boolean;
  enrollmentCount: number;
  createdAt: string;
}

/** Admin süpervizör detay sayfası */
export interface SupervisorAdminDetail extends Supervisor {
  accountEmail?: string | null;
  emailVerified?: boolean;
  appointmentCount: number;
  courses: SupervisorAdminCourseSummary[];
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: number;
  status: CourseEnrollmentStatus;
  message?: string | null;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    profession?: string | null;
  };
  course?: Pick<Course, "id" | "title" | "slug" | "supervisorId">;
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

export interface HeroContent {
  eyebrow: string;
  headlinePrefix: string;
  headlineWords: string[];
  headlineSuffix: string;
  subtext: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  statYears: number;
  statSessions: number;
  statRating: number;
  imageUrl: string | null;
  imageAlt: string;
  badgeText: string;
  floatingKeywords: string[];
}

export interface HomeContent {
  trustLabels: string[];
  whyEyebrow: string;
  whyTitle: string;
  whyHighlight: string;
  whyFeatureTitles: string[];
  whyFeatureDescs: string[];
  whyStepTitles: string[];
  whyStepDescs: string[];
}

export type AdDisplayMode = "IMAGE_ONLY" | "IMAGE_WITH_TEXT";

export interface Advertisement {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayMode: AdDisplayMode;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}
