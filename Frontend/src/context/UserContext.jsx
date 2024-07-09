"use client";

import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import React from "react";
import { useDispatch } from "react-redux";

export const UserContext = React.createContext({});

const UserContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [authenticated, setAuthenticated] = React.useState(false);
  const dispatch = useDispatch();
  console.log(user);

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
            method: "GET",
            headers: {
              Authorization: localStorage.getItem("token"),
            },
            credentials: "include",
          }
        );
        if (!response.ok) {

          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
        setUser(data.userInfo);
        setAuthenticated(true);
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
