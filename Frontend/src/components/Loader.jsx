import React from "react";
import { useSelector } from "react-redux";

export default function Loader() {
  const isLoading = useSelector((state) => state.loader.isLoading);
  if (!isLoading) {
    return null;
  }

  return (
    <div className="w-screen h-screen fixed z-10 flex justify-center items-center bg-white dark:bg-gray-900">
      <div className="loader">Mr Engineers</div>
      <style jsx>{`
        .loader {
          font-size: 4rem;
          font-weight: 700;
          position: relative;
          color: transparent;
          text-transform: uppercase;
          -webkit-text-stroke: 2px #09f; /* Outline color */
          background: linear-gradient(90deg, #09f, #ff0099, #09f, #00ffcc);
          background-size: 200%;
          -webkit-background-clip: text;
          animation: outline 2s ease-in-out infinite; /* Animation tweaks */
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        @keyframes outline {
          0% {
            background-position: 200% center;
            transform: scale(1); /* Add initial scale */
          }
          50% {
            background-position: -200% center;
            transform: scale(1.2); /* Expand slightly */
          }
          100% {
            background-position: 200% center;
            transform: scale(1); /* Back to original size */
          }
        }
      `}</style>
    </div>
  );
}
