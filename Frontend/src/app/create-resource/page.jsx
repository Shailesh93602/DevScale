"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchResources = async () => {
      dispatch(showLoader());
      try {
        const response = await fetchData("GET", "/topics/unpublished");
        const data = response.data;
        setResources(data.topics);
        setAvailableTags([
          ...new Set(data.topics?.flatMap((resource) => resource.tags)),
        ]);
      } catch (error) {
        toast.error("Something went wrong, Please try again!");
      }
      dispatch(hideLoader());
    };
    fetchResources();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTagSelection = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filteredResources = resources?.filter(
    (resource) =>
      (resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (selectedTags.length === 0 ||
        selectedTags.some((tag) => resource.tags?.includes(tag)))
  );

  return (
    <div className="bg-white dark:bg-gray-800 mx-auto p-6 ">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Available Topics
        </h1>
        <input
          type="text"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mb-6">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelection(tag)}
              className={`m-1 p-2 border rounded ${
                selectedTags.includes(tag)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {filteredResources?.length > 0 ? (
          <ul className="space-y-6">
            {filteredResources.map((resource, index) => (
              <li
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {resource.name}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {resource.description}
                </p>
                <a
                  href={`/create-resource/${resource.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:underline mt-2 block"
                >
                  Add Article
                </a>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {resource.category}
                </span>
                <div className="mt-2">
                  {resource.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs px-2 py-1 rounded-full mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No topics found.</p>
        )}
      </div>
    </div>
  );
}
