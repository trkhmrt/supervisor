export const DEFAULT_BLOG_AUTHOR_SLUG = "abdullatif-ramazan-celik";
export const DEFAULT_BLOG_AUTHOR_NAME = "Abdullatif Ramazan Çelik";
export const DEFAULT_BLOG_AUTHOR_PHOTO = "/images/abdullatif.png";
export const DEFAULT_BLOG_AUTHOR_TITLE = "Klinik Süpervizör";

export function resolveBlogAuthorProfileSlug(post: {
  authorSlug?: string;
  author: string;
}): string | null {
  if (post.authorSlug) return post.authorSlug;
  const name = post.author.trim().toLowerCase();
  if (name.includes("abdullatif") || name === DEFAULT_BLOG_AUTHOR_NAME.toLowerCase()) {
    return DEFAULT_BLOG_AUTHOR_SLUG;
  }
  return null;
}

export function blogAuthorProfileHref(post: {
  authorSlug?: string;
  author: string;
}): string | null {
  const slug = resolveBlogAuthorProfileSlug(post);
  return slug ? `/yazar/${slug}` : null;
}
