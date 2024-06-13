"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      document.cookie =
        "token=; Max-Age=0; path=/; domain=http://localhost:3000";
      router.push("/u/login");
    };

    logout();
  }, [router]);

  return null;
}
