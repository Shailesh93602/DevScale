'use client';
import React, { useEffect, useState } from 'react';
import { FocusCards } from '@/components/FocusCards';
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { toast } from 'react-toastify';
import { useAxiosGet } from '@/hooks/useAxios';

interface IRoadmap {
  id: string;
  title: string;
}

const Roadmap = () => {
  const dispatch = useDispatch();
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [getRoadmaps] = useAxiosGet<IRoadmap[]>('/roadmaps');

  const fetchRoadmaps = async () => {
    dispatch(showLoader('fetching roadmaps'));
    try {
      const response = await getRoadmaps();
      setRoadmaps(response.data ?? []);
    } catch (error: unknown) {
      toast.error('Error fetching resources, Please try again');
      console.error((error as { message: string }).message);
    }
    dispatch(hideLoader('fetching roadmaps'));
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  return (
    <div className="mx-auto w-full p-6">
      {/* bg-lightSecondary shadow-2xl rounded-lg p-6 */}
      <div>
        <h2 className="relative z-20 text-center font-sans text-2xl font-bold tracking-tight md:text-4xl lg:text-7xl">
          Choose a roadmap to
          <div className="relative mx-auto inline-block w-max">
            <div className="absolute left-0 top-[1px] py-4">
              <span className="">start your journey.</span>
            </div>
            <div className="relative bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text bg-no-repeat py-4 text-transparent">
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
