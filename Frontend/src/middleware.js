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
];

export async function middleware(req) {
  if (protectedPages.find((page) => page === req.nextUrl.pathname)) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/u/login";
      return NextResponse.redirect(url);
    } else {
      customAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await customAxios.get("/profile");
      if (response.data === "Unauthorized") {
        const url = req.nextUrl.clone();
        url.pathname = "/u/login";
        return NextResponse.redirect(url);
      } else {
        return NextResponse.next();
      }
    }
  } else {
    return NextResponse.next();
  }
}
