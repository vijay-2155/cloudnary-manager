/**
 * Inject Cloudinary transformation params into a secure_url.
 * Inserts params after /upload/ so Cloudinary serves a resized,
 * format-optimised variant without the client downloading the full original.
 */
export function cloudinaryThumb(url: string, transforms = 'w_400,c_fill,f_auto,q_auto'): string {
  return url.replace('/upload/', `/upload/${transforms}/`);
}
