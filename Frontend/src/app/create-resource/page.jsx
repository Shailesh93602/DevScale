"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ResourceEditor = () => {
  const [content, setContent] = useState("");

  const saveResource = () => {
    console.log("Content: ", content);
    toast.success("Resource saved successfully!");
  };

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create a Resource</h1>
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
          theme="snow"
          placeholder="Start writing your resource..."
          style={{
            height: 400,
            maxHeight: 400,
            overflowY: "auto",
            padding: "1rem",
            borderRadius: "0.5rem",
          }}
        />
      </div>
      <button
        onClick={saveResource}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
      >
        Save Resource
      </button>
    </div>
  );
};

export default ResourceEditor;
