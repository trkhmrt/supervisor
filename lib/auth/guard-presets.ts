import { SCOPES } from "@/lib/auth/permissions";
import type { GuardOptions } from "@/lib/auth/guard";

/** API route'larında withAuth(handler, GUARD.supervisors.create) şeklinde kullanın */
export const GUARD = {
  supervisors: {
    list: { roles: "admin", scopes: SCOPES.SUPERVISORS_LIST } satisfies GuardOptions,
    create: { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.SUPERVISORS_UPDATE } satisfies GuardOptions,
    delete: { roles: "admin", scopes: SCOPES.SUPERVISORS_DELETE } satisfies GuardOptions,
  },
  services: {
    list: { roles: "admin", scopes: SCOPES.SERVICES_LIST } satisfies GuardOptions,
    create: { roles: "admin", scopes: SCOPES.SERVICES_CREATE } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.SERVICES_UPDATE } satisfies GuardOptions,
    delete: { roles: "admin", scopes: SCOPES.SERVICES_DELETE } satisfies GuardOptions,
  },
  panel: {
    appointmentsList: {
      roles: ["user", "supervisor"],
      lightAuth: true,
      requireEmailVerified: true,
    } satisfies GuardOptions,
    enrollmentsList: {
      roles: ["user", "supervisor"],
      lightAuth: true,
    } satisfies GuardOptions,
    courseApply: {
      roles: "user",
      lightAuth: true,
      requireEmailVerified: true,
    } satisfies GuardOptions,
  },
  supervisor: {
    courses: {
      roles: "supervisor",
      lightAuth: true,
      requireEmailVerified: true,
    } satisfies GuardOptions,
    availability: {
      roles: "supervisor",
      lightAuth: true,
      requireEmailVerified: true,
    } satisfies GuardOptions,
  },
  appointments: {
    list: { roles: "admin", scopes: SCOPES.APPOINTMENTS_LIST } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.APPOINTMENTS_UPDATE } satisfies GuardOptions,
  },
  invites: {
    list: { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE } satisfies GuardOptions,
    create: { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE } satisfies GuardOptions,
    delete: { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE } satisfies GuardOptions,
  },
  applications: {
    list: { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE } satisfies GuardOptions,
    invite: { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE } satisfies GuardOptions,
  },
  courses: {
    list: { roles: "admin", scopes: SCOPES.SUPERVISORS_LIST } satisfies GuardOptions,
  },
  users: {
    list: { roles: "admin", scopes: SCOPES.USERS_LIST } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.USERS_LIST } satisfies GuardOptions,
  },
  blog: {
    list: { roles: "admin", scopes: SCOPES.SETTINGS_READ } satisfies GuardOptions,
    write: { roles: "admin", scopes: SCOPES.SETTINGS_UPDATE } satisfies GuardOptions,
  },
  content: {
    messages: { roles: "admin", scopes: SCOPES.SETTINGS_READ } satisfies GuardOptions,
    newsletter: { roles: "admin", scopes: SCOPES.SETTINGS_READ } satisfies GuardOptions,
  },
  settings: {
    read: { roles: "admin", scopes: SCOPES.SETTINGS_READ } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.SETTINGS_UPDATE } satisfies GuardOptions,
  },
  ads: {
    list: { roles: "admin", scopes: SCOPES.SETTINGS_READ } satisfies GuardOptions,
    write: { roles: "admin", scopes: SCOPES.SETTINGS_UPDATE } satisfies GuardOptions,
  },
  admins: {
    list: { roles: "admin", scopes: SCOPES.ADMINS_LIST, adminPanelOnly: true } satisfies GuardOptions,
    create: { roles: "admin", scopes: SCOPES.ADMINS_CREATE, adminPanelOnly: true } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.ADMINS_UPDATE, adminPanelOnly: true } satisfies GuardOptions,
    delete: { roles: "admin", scopes: SCOPES.ADMINS_DELETE, adminPanelOnly: true } satisfies GuardOptions,
  },
  profile: {
    update: { roles: ["user", "supervisor", "admin"], lightAuth: true } satisfies GuardOptions,
  },
} as const;
