"use client";

import React from "react";

export const UserContext = React.createContext({});

const UserContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/profile", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUser(data.userInfo);
        setAuthenticated(data.success);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ user, authenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
