import React from "react";
import { useSelector } from "react-redux";

export default function Loader() {
  const isLoading = useSelector((state) => state.loader.isLoading);
  if (!isLoading) {
    return null;
  }
  return (
    <div className="w-screen h-screen z-10 flex justify-center items-center">
      <div className="loader"></div>
      <style jsx>{`
        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s ease infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
