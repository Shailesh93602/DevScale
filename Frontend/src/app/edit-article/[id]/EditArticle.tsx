"use client";
import React from "react";
// import dynamic from "next/dynamic";
import { toast } from "react-toastify";
// import "react-quill/dist/quill.snow.css";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import Navbar from "@/components/Navbar";

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditArticle({
  content,
  id,
}: {
  id: string;
  content: string;
}) {
  const dispatch = useDispatch();

  const updateArticle = async () => {
    try {
      dispatch(showLoader());
      const response = await fetchData("post", `/articles/${id}/update`, {
        content,
      });

      if (response.data.success) {
        toast.success("Article updated successfully!");
        window.location.href = `/articles/${id}`;
      } else {
        toast.error("Failed to update article.");
      }
    } catch (error) {
      toast.error("Failed to update article.");
      console.error(error);
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          {/* <ReactQuill
            value={content}
            onChange={setContent}
            preserveWhitespace
            modules={{
              toolbar: [
                [{ font: [] }, { size: [] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ direction: "rtl" }, { align: [] }],
                ["link", "image", "video"],
                ["clean"],
              ],
              // indent: {
              //   levels: [1, 2, 3, 4, 5],
              // },
            }}
          /> */}
        </div>
        <button
          onClick={updateArticle}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Update Article
        </button>
      </div>
    </>
  );
}
