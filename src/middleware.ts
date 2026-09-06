import { auth } from "@/lib/auth";

export default auth((req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
  return undefined;
});

export const config = {
  matcher: ["/admin/:path*"],
};