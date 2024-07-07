import { NextResponse } from "next/server";

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
      const response = await fetch(
        (process.env.NEXT_PUBLIC_BASE_URL ||
          "https://mrengineersapi.vercel.app") + +"/profile",
        {
          credentials: "include",
          headers: {
            Cookie: req.headers.get("cookie"),
          },
        }
      );
      if (response.status == 401) {
        const url = req.nextUrl.clone();
        url.pathname = "/u/login";
        return NextResponse.redirect(url);
      } else {
        const json = await response.json();
        console.log(json);
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
