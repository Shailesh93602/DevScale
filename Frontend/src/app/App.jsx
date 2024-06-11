"use client";
import UserContextProvider from '@/context/UserContext';
import { useEffect, useState } from "react";


export default function App({ children }) {
  const [theme, setTheme] = useState("light");

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
        <button
          onClick={toggleTheme}
          className="py-2 px-4 text-gray-700 hover:text-gray-900"
        >
          Toggle Theme
        </button>
        {children}
      </div>

    </>


  );
}
