"use client";

import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import React from "react";
import { useDispatch } from "react-redux";

export const UserContext = React.createContext({});

const UserContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [authenticated, setAuthenticated] = React.useState(false);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const fetchData = async () => {
      dispatch(showLoader());
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAuthenticated(false);
        }
        const response = await fetch(
          (process.env.NEXT_PUBLIC_BASE_URL ||
            "https://mrengineersapi.vercel.app") + "/profile",
          {
            credentials: "include",
            headers: {
              Authorization: token,
            },
          }
        );
        if (!response.ok) {
          console.error(response);
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUser(data.userInfo);
        setAuthenticated(data.success);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
      dispatch(hideLoader());
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ user, authenticated, setAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
