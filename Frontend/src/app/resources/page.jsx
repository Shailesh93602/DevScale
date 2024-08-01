"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchResources = async () => {
      dispatch(showLoader());
      try {
        const response = await fetchData("GET", "/resources");
        setResources(response.data.resources);
      } catch (error) {
        toast.error("Error fetching resources, Please try again");
      }
      dispatch(hideLoader());
    };
    fetchResources();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredResources = resources?.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 mx-auto p-6 ">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Resources
        </h1>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
                  href={`/resources/${resource.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:underline mt-2 block"
                >
                  Visit Resource
                </a>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {resource.category}
                </span>
                <div className="flex gap-2">
                  {resource.tags?.map((tag) => (
                    <span className=" bg-blue-100 dark:bg-gray-900 rounded-lg px-2">
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            No resources found.
          </p>
        )}
      </div>
    </div>
  );
}
