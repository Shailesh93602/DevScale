"use client";
import React, { useEffect, useState } from "react";
import { FocusCards } from "@/components/focus-cards";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "../services/fetchData";
import { toast } from "react-toastify";

const Roadmap = () => {
  const dispatch = useDispatch();
  const [roadmaps, setRoadmaps] = useState<{ id: string; title: string }[]>([]);

  const fetchRoadmaps = async () => {
    dispatch(showLoader());
    try {
      const response = await fetchData("GET", "/roadMaps");
      setRoadmaps(response.data);
    } catch (error: unknown) {
      toast.error("Error fetching resources, Please try again");
      console.error((error as { message: string }).message);
    }
    dispatch(hideLoader());
  };

  useEffect(() => {
    fetchRoadmaps();
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
          <FocusCards roadmaps={roadmaps} />
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
