"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function App({ children }) {
  const [theme, setTheme] = useState("light");
  const path = usePathname();
  let showNavbar = false;
  const routes = [
    "/dashboard",
    "/profile",
    "/resources",
    "/coding-challenges",
    "/career-roadmap",
    "/placement-preparation",
    "/community",
  ];
  if (routes.find((route) => route === path)) showNavbar = true;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      <div>
        {showNavbar && <Navbar />}

        {children}
        <Footer />
      </div>
    </>
  );
}
