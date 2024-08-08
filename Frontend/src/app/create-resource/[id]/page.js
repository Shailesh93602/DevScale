// pages/resourceEditor.js
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

const ResourceEditor = ({ params }) => {
  const { id } = params;
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [content, setContent] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSubjectAndTopic = async () => {
      try {
        const response = await fetchData("get", `/topics/${id}`);
        if (response.data.success) {
          setSubject(response.data.data.subject);
          setTopic(response.data.data.topic);
        } else {
          toast.error("Failed to load topic details.");
        }
      } catch (error) {
        console.error("Error fetching subject and topic:", error);
        toast.error("Error fetching topic details.");
      }
    };

    fetchSubjectAndTopic();
  }, [id]);

  const saveResource = async () => {
    try {
      dispatch(showLoader());
      const response = await fetchData("post", `/resources/save/${id}`, {
        subtopic,
        content,
      });

      if (response.data.success) {
        toast.success("Resource saved successfully!");
        setContent("");
        window.location.href = "/resources";
      } else {
        toast.error("Failed to save resource.");
      }
    } catch (error) {
      toast.error("Failed to save resource.");
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Add Content for {topic}</h1>
        <div className="mb-4">
          <p className="text-gray-700 dark:text-white p-2 w-full">
            {subtopic ? `Subtopic: ${subtopic}` : "General Topic"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <ReactQuill
            value={content}
            onChange={setContent}
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
            }}
          />
        </div>
        <button
          onClick={saveResource}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Save Resource
        </button>
      </div>
    </>
  );
};

export default ResourceEditor;
