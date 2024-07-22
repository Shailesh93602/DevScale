// pages/resourceEditor.js
"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ResourceEditor = ({ params }) => {
  const { id } = params;
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [content, setContent] = useState("");

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      dispatch(showLoader());
      try {
        const response = await fetchData("get", `/resources/details/${id}`);
        console.log(response);
        if (response.data?.success) {
          const { subject, topic, subtopic, content } = response.data;
          setSubject(subject);
          setTopic(topic);
          setSubtopic(subtopic);
          setContent(content);
        } else {
          toast.error("Failed to fetch resource details.");
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong, Please try again!");
      } finally {
        dispatch(hideLoader());
      }
    };
    fetchData();
  }, [id, dispatch]);

  const saveResource = async () => {
    try {
      dispatch(showLoader());
      const response = await axios.post("/api/resources", {
        subject,
        topic,
        subtopic,
        content,
      });

      if (response.data.success) {
        toast.success("Resource saved successfully!");
      } else {
        toast.error("Failed to save resource.");
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error("Failed to save resource.");
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create a Resource</h1>
      <div className="mb-4">
        <p className="text-black dark:text-white p-2 w-full">{subject}</p>
      </div>
      <div className="mb-4">
        <p className="text-black dark:text-white p-2 w-full">{topic}</p>
      </div>
      {subtopic && (
        <div className="mb-4">
          <p className="text-black dark:text-white p-2 w-full">{subtopic}</p>
        </div>
      )}
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
  );
};

export default ResourceEditor;
