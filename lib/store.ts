"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Appointment,
  AppointmentStatus,
  BlogPost,
  ContactMessage,
  NewsletterSubscriber,
  Review,
  Service,
  SiteSettings,
  Supervisor,
  SupervisorInvite,
  User,
} from "./types";
import {
  APPOINTMENTS,
  BLOG_POSTS,
  CONTACT_MESSAGES,
  NEWSLETTER,
  REVIEWS,
  SITE_SETTINGS,
  SUPERVISOR_INVITES,
  USERS,
} from "./mockData";
import { generateId, generateMeetLink, slugify } from "./utils";

interface AppState {
  users: User[];
  supervisors: Supervisor[];
  appointments: Appointment[];
  services: Service[];
  blogPosts: BlogPost[];
  reviews: Review[];
  invites: SupervisorInvite[];
  newsletter: NewsletterSubscriber[];
  contactMessages: ContactMessage[];
  settings: SiteSettings;
  currentUserId: string | null;
  /** Supabase oturum kontrolü tamamlandı mı (yanlış /giris yönlendirmesini önler). */
  authReady: boolean;

  login: (email: string, password: string) => User | null;
  setAuthUser: (user: User) => void;
  setAuthReady: (ready: boolean) => void;
  logout: () => void;
  registerSupervisee: (data: {
    email: string;
    password: string;
    fullName: string;
    profession?: string;
    experienceYears?: number;
  }) => User;
  registerSupervisorFromInvite: (
    token: string,
    data: {
      email: string;
      password: string;
      fullName: string;
      title: string;
      bio: string;
      license: string;
      expertise: string[];
      pricePerSession: number;
    }
  ) => User | null;
  verifyEmail: (userId: string) => void;

  inviteSupervisor: (email: string) => SupervisorInvite;
  removeInvite: (id: string) => void;
  getInviteByToken: (token: string) => SupervisorInvite | undefined;

  createAppointment: (data: Omit<Appointment, "id" | "createdAt" | "status" | "paymentApproved">) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  approvePayment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, startTime: string, endTime: string) => void;

  updateSupervisorAvailability: (supervisorId: string, slots: Supervisor["availability"]) => void;
  upsertSupervisor: (supervisor: Supervisor) => void;
  deleteSupervisor: (id: string) => void;

  upsertService: (service: Service) => void;
  toggleService: (id: string) => void;

  upsertBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  publishBlogPost: (id: string, published: boolean) => void;

  addReview: (review: Omit<Review, "id" | "createdAt">) => void;

  addNewsletter: (email: string) => boolean;
  addContactMessage: (data: Omit<ContactMessage, "id" | "createdAt" | "read">) => void;
  markMessageRead: (id: string) => void;

  updateSettings: (settings: Partial<SiteSettings>) => void;

  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: USERS,
      supervisors: [],
      appointments: APPOINTMENTS,
      services: [],
      blogPosts: BLOG_POSTS,
      reviews: REVIEWS,
      invites: SUPERVISOR_INVITES,
      newsletter: NEWSLETTER,
      contactMessages: CONTACT_MESSAGES,
      settings: SITE_SETTINGS,
      currentUserId: null,
      authReady: false,

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ currentUserId: user.id });
          return user;
        }
        return null;
      },

      setAuthUser: (user) =>
        set((s) => {
          const idx = s.users.findIndex((u) => u.id === user.id);
          const users =
            idx >= 0 ? s.users.map((u, i) => (i === idx ? user : u)) : [...s.users, user];
          return { users, currentUserId: user.id, authReady: true };
        }),

      setAuthReady: (ready) => set({ authReady: ready }),

      logout: () => set({ currentUserId: null, authReady: true }),

      registerSupervisee: (data) => {
        const user: User = {
          id: generateId(),
          email: data.email,
          fullName: data.fullName,
          role: "user",
          emailVerified: false,
          profession: data.profession,
          experienceYears: data.experienceYears,
          createdAt: new Date().toISOString(),
          password: data.password,
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return user;
      },

      registerSupervisorFromInvite: (token, data) => {
        const invite = get().invites.find((i) => i.token === token && i.status === "pending");
        if (!invite) return null;
        const user: User = {
          id: generateId(),
          email: data.email,
          fullName: data.fullName,
          title: data.title,
          role: "supervisor",
          emailVerified: false,
          license: data.license,
          createdAt: new Date().toISOString(),
          password: data.password,
        };
        const supervisor: Supervisor = {
          id: `sup-${generateId()}`,
          userId: user.id,
          fullName: data.fullName,
          title: data.title,
          photo: "https://i.pravatar.cc/300?u=" + user.id,
          bio: data.bio,
          expertise: data.expertise,
          pricePerSession: data.pricePerSession,
          currency: "TRY",
          rating: 0,
          reviewCount: 0,
          yearsExperience: 0,
          license: data.license,
          languages: ["Türkçe"],
          approaches: [],
          availability: [],
        };
        set((s) => ({
          users: [...s.users, user],
          supervisors: [...s.supervisors, supervisor],
          invites: s.invites.map((i) =>
            i.id === invite.id ? { ...i, status: "accepted", acceptedAt: new Date().toISOString() } : i
          ),
          currentUserId: user.id,
        }));
        return user;
      },

      verifyEmail: (userId) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, emailVerified: true } : u)),
        })),

      inviteSupervisor: (email) => {
        const invite: SupervisorInvite = {
          id: generateId(),
          token: generateId() + "-" + generateId(),
          email,
          invitedAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ invites: [...s.invites, invite] }));
        return invite;
      },

      removeInvite: (id) =>
        set((s) => ({ invites: s.invites.filter((i) => i.id !== id) })),

      getInviteByToken: (token) => get().invites.find((i) => i.token === token),

      createAppointment: (data) => {
        const appt: Appointment = {
          ...data,
          id: generateId(),
          status: "pending_payment",
          paymentApproved: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          appointments: [...s.appointments, appt],
          supervisors: s.supervisors.map((sup) =>
            sup.id === data.supervisorId
              ? {
                  ...sup,
                  availability: sup.availability.map((slot) =>
                    slot.date === data.date && slot.startTime === data.startTime
                      ? { ...slot, isBooked: true }
                      : slot
                  ),
                }
              : sup
          ),
        }));
        return appt;
      },

      updateAppointmentStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      approvePayment: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  paymentApproved: true,
                  status: "confirmed",
                  meetLink: a.meetLink ?? generateMeetLink(),
                }
              : a
          ),
        })),

      cancelAppointment: (id) =>
        set((s) => {
          const appt = s.appointments.find((a) => a.id === id);
          return {
            appointments: s.appointments.map((a) =>
              a.id === id ? { ...a, status: "cancelled" } : a
            ),
            supervisors: appt
              ? s.supervisors.map((sup) =>
                  sup.id === appt.supervisorId
                    ? {
                        ...sup,
                        availability: sup.availability.map((slot) =>
                          slot.date === appt.date && slot.startTime === appt.startTime
                            ? { ...slot, isBooked: false }
                            : slot
                        ),
                      }
                    : sup
                )
              : s.supervisors,
          };
        }),

      rescheduleAppointment: (id, date, startTime, endTime) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, date, startTime, endTime, status: "rescheduled" } : a
          ),
        })),

      updateSupervisorAvailability: (supervisorId, slots) =>
        set((s) => ({
          supervisors: s.supervisors.map((sup) =>
            sup.id === supervisorId ? { ...sup, availability: slots } : sup
          ),
        })),

      upsertSupervisor: (supervisor) =>
        set((s) => ({
          supervisors: s.supervisors.find((x) => x.id === supervisor.id)
            ? s.supervisors.map((x) => (x.id === supervisor.id ? supervisor : x))
            : [...s.supervisors, supervisor],
        })),

      deleteSupervisor: (id) =>
        set((s) => ({ supervisors: s.supervisors.filter((x) => x.id !== id) })),

      upsertService: (service) =>
        set((s) => ({
          services: s.services.find((x) => x.id === service.id)
            ? s.services.map((x) => (x.id === service.id ? service : x))
            : [...s.services, service],
        })),

      toggleService: (id) =>
        set((s) => ({
          services: s.services.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
        })),

      upsertBlogPost: (post) =>
        set((s) => {
          const slug = post.slug || slugify(post.title);
          const next = { ...post, slug };
          return {
            blogPosts: s.blogPosts.find((x) => x.id === post.id)
              ? s.blogPosts.map((x) => (x.id === post.id ? next : x))
              : [...s.blogPosts, next],
          };
        }),

      deleteBlogPost: (id) =>
        set((s) => ({ blogPosts: s.blogPosts.filter((x) => x.id !== id) })),

      publishBlogPost: (id, published) =>
        set((s) => ({
          blogPosts: s.blogPosts.map((x) => (x.id === id ? { ...x, published } : x)),
        })),

      addReview: (review) =>
        set((s) => ({
          reviews: [
            ...s.reviews,
            {
              ...review,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      addNewsletter: (email) => {
        const exists = get().newsletter.some(
          (n) => n.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) return false;
        set((s) => ({
          newsletter: [
            ...s.newsletter,
            {
              id: generateId(),
              email,
              subscribedAt: new Date().toISOString(),
            },
          ],
        }));
        return true;
      },

      addContactMessage: (data) =>
        set((s) => ({
          contactMessages: [
            ...s.contactMessages,
            {
              ...data,
              id: generateId(),
              createdAt: new Date().toISOString(),
              read: false,
            },
          ],
        })),

      markMessageRead: (id) =>
        set((s) => ({
          contactMessages: s.contactMessages.map((m) =>
            m.id === id ? { ...m, read: true } : m
          ),
        })),

      updateSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),

      resetAll: () =>
        set({
          users: USERS,
          supervisors: [],
          appointments: APPOINTMENTS,
          services: [],
          blogPosts: BLOG_POSTS,
          reviews: REVIEWS,
          invites: SUPERVISOR_INVITES,
          newsletter: NEWSLETTER,
          contactMessages: CONTACT_MESSAGES,
          settings: SITE_SETTINGS,
          currentUserId: null,
        }),
    }),
    {
      name: "supervizyon-store",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      skipHydration: true,
      partialize: (state) => ({
        users: state.users,
        appointments: state.appointments,
        blogPosts: state.blogPosts,
        reviews: state.reviews,
        invites: state.invites,
        newsletter: state.newsletter,
        contactMessages: state.contactMessages,
        settings: state.settings,
        currentUserId: state.currentUserId,
      }),
      migrate: (persisted, fromVersion) => {
        const s = persisted as Record<string, unknown>;
        if (fromVersion < 2) {
          return { ...s, supervisors: [], services: [] };
        }
        return s;
      },
    }
  )
);

export function useCurrentUser() {
  const userId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return userId ? users.find((u) => u.id === userId) ?? null : null;
}
