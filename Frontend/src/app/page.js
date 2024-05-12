"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      <h1>Welcome</h1>
      <div className="flex gap-5">
        <Link href="u/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Register</Link>
        <Link href="u/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login</Link>
      </div>
    </div>
  );
}
