import { NextResponse } from "next/server";
import { fetchData } from "./app/services/fetchData";

const protectedPages = [
  // "/dashboard",
  // "/profile",
  // "/resources",
  // "/coding-challenges",
  // "/career-roadmap",
  // "/placement-preparation",
  // "/community",
];

export async function middleware(req) {
  if (protectedPages.find((page) => page === req.nextUrl.pathname)) {
    const token = req.cookies.get("token");
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/u/login";
      return NextResponse.redirect(url);
    } else {
      const response = await fetchData("get", "/profile");
      if (response.status == 401) {
        const url = req.nextUrl.clone();
        url.pathname = "/u/login";
        return NextResponse.redirect(url);
      } else {
        const json = await response.json();
        NextResponse.next();
      }
    }
  } else {
    const token = req.cookies.get("token");
    if (token) {
      const url = req.nextUrl.clone();
      // document.cookie = "token=; Max-Age=0; path=/";
      return NextResponse.next();
    } else {
      return NextResponse.next();
    }
  }
}

// export default function () {}
