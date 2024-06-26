// "use client";

// import React from "react";

// export const UserContext = React.createContext({});

// const UserContextProvider = ({ children }) => {
//   const [user, setUser] = React.useState(null);
//   const [authenticated, setAuthenticated] = React.useState(false);

//   React.useEffect(() => {
//     const fetchData = async () => {
//       //   try {
//       //     console.log('hi');
//       //     const response = await fetch("https://mrengineersapi.vercel.app/profile", {
//       //       credentials: "include",
//       //     });
//       //     if (!response.ok) {
//       //       throw new Error("Network response was not ok");
//       //     }
//       //     const data = await response.json();
//       //     setUser(data.userInfo);
//       //     setAuthenticated(data.success);
//       //   } catch (error) {
//       //     console.error("There was a problem with the fetch operation:", error);
//       //   }
//       // };
//       try {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//           setAuthenticated(false);
//         }
//         const response = await fetch("https://mrengineersapi.vercel.app/profile", {
//           credentials: "include",
//         });
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         const data = await response.json();
//         setUser(data.userInfo);
//         setAuthenticated(data.success);
//       } catch (error) {
//         console.error("There was a problem with the fetch operation:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, authenticated, setAuthenticated }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export default UserContextProvider;
