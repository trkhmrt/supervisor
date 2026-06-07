import { slugify } from "@/lib/utils";
import type { Service } from "@/lib/types";

export type ServiceFormData = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  features: string;
  icon: string;
  duration: string;
  price: string;
  isGroupService: boolean;
  active: boolean;
};

export const DEFAULT_FEATURES = "50 dakikalık online seans\nVaka odaklı çalışma";

export const EMPTY_SERVICE_FORM: ServiceFormData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  features: DEFAULT_FEATURES,
  icon: "user",
  duration: "50",
  price: "0",
  isGroupService: false,
  active: true,
};

export function serviceToForm(s: Service): ServiceFormData {
  return {
    name: s.name,
    slug: s.slug,
    shortDescription: s.shortDescription,
    description: s.description,
    features: s.features.join("\n"),
    icon: s.icon,
    duration: String(s.duration),
    price: String(s.price),
    isGroupService: s.isGroupService,
    active: s.active,
  };
}

export function parseServiceFormPayload(form: ServiceFormData) {
  const name = form.name.trim();
  const slug = (form.slug.trim() ? slugify(form.slug) : slugify(name)) || "hizmet";
  const features = form.features
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    name,
    slug,
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    features,
    icon: form.icon,
    price: Number(form.price) || 0,
    duration: Number(form.duration) || 50,
    isGroupService: form.isGroupService,
    active: form.active,
  };
}
