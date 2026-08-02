/**
 * Insere uma transformação Cloudinary (redimensionar + qualidade/formato automáticos) num URL
 * já existente. URLs que não sejam do Cloudinary (placeholders, colados manualmente) ficam
 * inalterados — não há como os otimizar sem passar pelo Cloudinary.
 */
export function cloudinaryResize(url: string, width: number): string {
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1 || !url.includes("res.cloudinary.com")) return url;

  const insertAt = index + marker.length;
  return `${url.slice(0, insertAt)}w_${width},c_limit,q_auto,f_auto/${url.slice(insertAt)}`;
}
