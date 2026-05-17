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
  admins: {
    list: { roles: "admin", scopes: SCOPES.ADMINS_LIST, adminPanelOnly: true } satisfies GuardOptions,
    create: { roles: "admin", scopes: SCOPES.ADMINS_CREATE, adminPanelOnly: true } satisfies GuardOptions,
    update: { roles: "admin", scopes: SCOPES.ADMINS_UPDATE, adminPanelOnly: true } satisfies GuardOptions,
    delete: { roles: "admin", scopes: SCOPES.ADMINS_DELETE, adminPanelOnly: true } satisfies GuardOptions,
  },
} as const;
