"use client";
import React, { useEffect, useState } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "../services/fetchData";

const Roadmap = () => {
  const dispatch = useDispatch();
  const [resources, setResources] = useState("");

  const fetchResources = async () => {
    dispatch(showLoader());
    try {
      const response = await fetchData("GET", "/roadMaps");
      setResources(response.data);
    } catch (error) {
      toast.error("Error fetching resources, Please try again");
    }
    dispatch(hideLoader());
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="w-full mx-auto p-6">
      {/* bg-lightSecondary shadow-2xl rounded-lg p-6 */}
      <div>
        <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center font-sans tracking-tight">
          Choose a roadmap to
          <div className="relative mx-auto inline-block w-max">
            <div className="absolute left-0 top-[1px] py-4">
              <span className="">start your journey.</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
              <span className="">start your journey.</span>
            </div>
          </div>
        </h2>
        <div className="mt-5">
          <FocusCards resources={resources} />
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
