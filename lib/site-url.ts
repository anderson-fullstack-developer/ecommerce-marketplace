export function getSiteUrl(requestOrigin?: string | null): string {
  return process.env.NEXT_PUBLIC_APP_URL || requestOrigin || "http://localhost:3000";
}
