import { NextResponse } from "next/server";
import customAxios from "./app/services/customAxios";

const protectedPages = [
  "/dashboard",
  "/profile",
  "/resources",
  "/coding-challenges",
  "/career-roadmap",
  "/placement-preparation",
  "/community",
  "/achievements",
  "/battle-zone",
  "/create-resource",
  "/article-listing",
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Check if the requested page is protected
  if (!protectedPages.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return redirectToLogin(req);
  }

  try {
    // Validate token
    const response = await validateToken(token);

    if (response === "Unauthorized") {
      return redirectToLogin(req);
    }

    // Token is valid, allow access to protected route
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return redirectToLogin(req);
  }
}

async function validateToken(token) {
  customAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  try {
    const response = await customAxios.get("/profile");
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return "Unauthorized";
    }
    throw error;
  }
}

function redirectToLogin(req) {
  const url = req.nextUrl.clone();
  url.pathname = "/u/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard",
    "/profile",
    "/resources",
    "/coding-challenges",
    "/career-roadmap",
    "/placement-preparation",
    "/community",
    "/achievements",
    "/battle-zone",
    "/create-resource",
    "/article-listing",
  ],
};
