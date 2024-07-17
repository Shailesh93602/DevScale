"use client";

import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import React from "react";
import { useDispatch } from "react-redux";

export const UserContext = React.createContext({});

const UserContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [authenticated, setAuthenticated] = React.useState(false);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const fetchUser = async () => {
      dispatch(showLoader());
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setAuthenticated(false);
        }
        const response = await fetchData("GET", "/profile");
        // if (!response.ok) {
        //   throw new Error("Network response was not ok");
        // }
        // const data = await response.json();
        setUser(response.data?.userInfo);
        setAuthenticated(true);
      } catch (error) {}
      dispatch(hideLoader());
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, authenticated, setAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
