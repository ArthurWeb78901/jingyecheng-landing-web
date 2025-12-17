import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PREFIXES = ["/admin", "/login", "/logout"];

function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 忽略 next 靜態檔與 API / 檔案
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 明確排除後台（避免未來新增語系規則時誤導）
  if (isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // 首頁 -> /en
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", req.url), 308);
  }

  // /zh 或 /zh/... -> /en 或 /en/...（保留子路徑）
  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const rest = pathname.replace(/^\/zh/, "") || "";
    return NextResponse.redirect(new URL(`/en${rest}`, req.url), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
