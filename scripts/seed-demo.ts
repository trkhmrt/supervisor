/**
 * Demo hizmetler + süpervizörler (+ müsaitlik slotları).
 * Kullanım: npm run seed:demo
 */
import { PrismaClient } from "@prisma/client";
import { BLOG_POSTS, SERVICES, SUPERVISORS } from "../lib/mockData";
import { ensureDefaultAvailabilitySlots } from "../lib/db/availability";

const prisma = new PrismaClient();

async function seedServices() {
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        id: s.id,
        slug: s.slug,
        name: s.name,
        shortDescription: s.shortDescription,
        description: s.description,
        features: s.features,
        icon: s.icon,
        price: s.price,
        duration: s.duration,
        active: s.active,
      },
      update: {
        name: s.name,
        shortDescription: s.shortDescription,
        description: s.description,
        features: s.features,
        icon: s.icon,
        price: s.price,
        duration: s.duration,
        active: s.active,
      },
    });
  }
  console.log(`Hizmetler: ${SERVICES.length} kayıt`);
}

async function seedSupervisors() {
  for (const sup of SUPERVISORS) {
    const { availability: _slots, userId, id, ...data } = sup;

    await prisma.supervisor.upsert({
      where: { id },
      create: {
        id,
        ...data,
        userId: userId
          ? await prisma.user
              .findUnique({ where: { id: userId } })
              .then((u) => (u ? userId : null))
          : null,
      },
      update: {
        fullName: data.fullName,
        title: data.title,
        photo: data.photo,
        bio: data.bio,
        pricePerSession: data.pricePerSession,
        currency: data.currency,
        rating: data.rating,
        reviewCount: data.reviewCount,
        yearsExperience: data.yearsExperience,
        license: data.license,
        expertise: data.expertise,
        languages: data.languages,
        approaches: data.approaches,
      },
    });

    await ensureDefaultAvailabilitySlots(sup.id);
  }
  console.log(`Süpervizörler: ${SUPERVISORS.length} kayıt (+ müsaitlik slotları)`);
}

async function seedBlogPosts() {
  for (const p of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        cover: p.cover,
        author: p.author,
        category: p.category,
        tags: p.tags,
        publishedAt: new Date(p.publishedAt),
        readingTime: p.readingTime,
        published: p.published,
      },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        cover: p.cover,
        author: p.author,
        category: p.category,
        tags: p.tags,
        publishedAt: new Date(p.publishedAt),
        readingTime: p.readingTime,
        published: p.published,
      },
    });
  }
  console.log(`Blog: ${BLOG_POSTS.length} yazı`);
}

async function main() {
  await seedServices();
  await seedSupervisors();
  await seedBlogPosts();
  console.log("Demo içerik hazır.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
