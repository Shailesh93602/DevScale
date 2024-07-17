"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";
import { Provider } from "react-redux";
import { store, persistor } from "@/lib/store";
import UserContextProvider from "@/context/UserContext";
import { PersistGate } from "redux-persist/integration/react";

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
    "/achievements",
    "/battle-zone",
  ];
  if (
    routes.find(
      (route) =>
        route === path || path.slice(0, path.lastIndexOf("/")) === route
    )
  )
    showNavbar = true;

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
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <UserContextProvider>
              <Loader />
              {showNavbar && <Navbar />}
              {children}
              <Footer />
            </UserContextProvider>
          </PersistGate>
        </Provider>
      </div>
    </>
  );
}
