"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import Navbar from "@/components/Navbar";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ArticleEditor = ({ params }) => {
  const { id } = params;
  const [content, setContent] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        dispatch(showLoader());
        const response = await fetchData("get", `/articles/${id}`);
        if (response.data.success) {
          setContent(response.data.article.content);
        } else {
          toast.error("Failed to load article.");
        }
      } catch (error) {
        toast.error("Failed to load article.");
      } finally {
        dispatch(hideLoader());
      }
    };

    fetchArticle();
  }, [id, dispatch]);

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
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <ReactQuill
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
              indent: {
                levels: [1, 2, 3, 4, 5],
              },
            }}
          />
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
};

export default ArticleEditor;
