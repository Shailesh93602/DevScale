"use client";
import React, { useEffect, useState } from "react";
// import Followcard from "../../components/followcard";
import { apiResponse } from "@/api/api";
import toast from "react-hot-toast";

const page = () => {
  const [users, setUsers] = useState("");
  useEffect(() => {
    const getallusers = async () => {
      try {
        const response = await apiResponse({
          method: "GET",
          endpoint: "/auth/users",
        });

        if (response.data?.success) {
          setUsers(response.data.data);

          if (response.status === 200) {
          }
        } else {
          toast.error(response.data?.message);
        }
      } catch (error) {
        toast.error("LogIn failed. Please try again later.");
      }
    };
    getallusers();
  }, []);
  return (
    <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
        Follow for challange your frineds
      </h1>
      {/* <Followcard users={users} /> */}
    </div>
  );
};

export default page;
