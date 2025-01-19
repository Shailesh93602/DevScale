"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content);
};

export default function Article({ id }: { id: string }) {
  const [article, setArticle] = useState<{
    id: string;
    title: string;
    author: { username: string };
    content: string;
    createdAt: string;
  }>();
  const [moderationNotes, setModerationNotes] = useState("");
  const [newNote, setNewNote] = useState("");

  const handleSaveNote = async () => {
    try {
      const response = await fetchData("post", `/articles/${id}/moderation`, {
        moderationNotes: newNote,
      });
      if (response.data.success) {
        toast.success("Moderation note saved successfully!");
        setNewNote("");
        window.location.href = "/article-listing";
      } else {
        toast.error("Failed to save moderation note.");
      }
    } catch (error) {
      console.error("Error saving moderation note:", error);
      toast.error("Error saving moderation note.");
    }
  };

  const fetchResource = async () => {
    try {
      const response = await fetchData("GET", `/articles/${id}`);

      if (response?.data?.success) {
        setArticle(response?.data?.article);
        setModerationNotes(response?.data?.article?.moderationNotes);
      } else {
        toast.error(response?.error ?? "Failed to fetch article.");
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Error fetching article.");
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{article?.title}</h1>
        <div className="mb-4">
          <p className="text-gray-700 dark:text-white">
            By {article?.author?.username}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(article?.createdAt ?? "").toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <p
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(article?.content ?? ""),
            }}
          ></p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-6">
          <h2 className="text-xl font-semibold mb-4">Moderation Notes</h2>
          {moderationNotes ? (
            <p className="mb-4">{moderationNotes}</p>
          ) : (
            <p className="mb-4 text-gray-500">No moderation notes yet.</p>
          )}
          <textarea
            className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add moderation notes here..."
          />
          <button
            onClick={handleSaveNote}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Save Note
          </button>
        </div>
      </div>
    </>
  );
}
