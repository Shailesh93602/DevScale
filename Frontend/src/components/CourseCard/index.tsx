import Image from 'next/image';
import React from 'react';
import { FiPlayCircle } from 'react-icons/fi';

const CourseCard = ({
  title,
  description,
  thumbnail,
  chapters,
  items,
  completed,
}: {
  title: string;
  description: string;
  thumbnail: string;
  chapters: number;
  items: number;
  completed: number;
}) => (
  <div className="relative transform rounded-2xl bg-lightSecondary p-6 shadow-lg transition-shadow duration-300 hover:scale-105 hover:shadow-xl">
    <Image
      src={thumbnail}
      alt="Course Thumbnail"
      className="mb-4 rounded-lg object-cover"
      width={400}
      height={150}
    />

    <div className="space-y-2">
      <h4 className="text-xl font-bold">{title}</h4>
      <p className="text-sm text-grayText">{description}</p>
      <div className="absolute right-2 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
        <FiPlayCircle size={24} />
      </div>
      <ProgressCircle completed={completed} />
    </div>
    <div className="mt-4 flex items-center">
      <span className="mr-4">{chapters} Chapters</span>
      <span>{items} Items</span>
    </div>
  </div>
);

const ProgressCircle = ({ completed }: { completed: number }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completed / 100) * circumference;

  return (
    <div className="relative mt-4 h-16 w-16">
      <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
        <circle
          className="text-gray-300"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-primary"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-primary">
        {completed}%
      </div>
    </div>
  );
};

export default CourseCard;
