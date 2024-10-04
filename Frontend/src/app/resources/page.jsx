"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import { debounce } from "@/utils/common";
import { Search, Book, Tag, ExternalLink } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { AceternityLogo } from "../page";

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const dispatch = useDispatch();
  const observerRef = useRef(null);

  const fetchResources = async (searchTerm, page, isAppending = false) => {
    if (loadingMore) return;
    setLoadingMore(true);
    dispatch(showLoader());

    try {
      const response = await fetchData(
        "GET",
        `/resources?search=${encodeURIComponent(
          searchTerm
        )}&page=${page}&limit=10`
      );

      const newResources = response.data.resources;

      setResources((prev) =>
        isAppending ? [...prev, ...newResources] : newResources
      );
      setHasMore(newResources.length > 0);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Error fetching resources. Please try again.");
    } finally {
      dispatch(hideLoader());
      setLoadingMore(false);
    }
  };

  const debouncedFetchResources = useMemo(
    () =>
      debounce(
        (searchTerm, page, isAppending) =>
          fetchResources(searchTerm, page, isAppending),
        300
      ),
    []
  );

  useEffect(() => {
    if (page === 1) {
      fetchResources(searchTerm, page, false);
    } else {
      debouncedFetchResources(searchTerm, page, true);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    setResources([]);
    debouncedFetchResources(searchTerm, 1, false);
  }, [searchTerm]);

  const lastResourceRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Discover Resources
        </h1>
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 pr-4 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>

        {resources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <div
                key={resource.id}
                ref={index === resources.length - 1 ? lastResourceRef : null}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Book className="mr-2" size={24} />
                    {resource.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {resource.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full px-3 py-1 text-sm font-medium flex items-center"
                      >
                        <Tag size={14} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.category}
                    </span>
                    {/* <a
                      href={`/resources/${resource.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                    >
                      View Resource
                      <ExternalLink size={16} className="ml-2" />
                    </a> */}
                    <HoverBorderGradient
                      href={`/resources/${resource.id}`}
                      containerClassName="rounded-full"
                      as="button"
                      className="dark:bg-blue-700 bg-white text-black dark:text-white flex items-center space-x-2"
                    >
                      <AceternityLogo />
                      <span>View Resource</span>
                    </HoverBorderGradient>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-100">
                  No resources found
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                  <p>
                    Try adjusting your search or browse our categories for more
                    options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingMore && (
          <div className="text-center text-gray-600 dark:text-gray-300 mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="mt-2">Loading more resources...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
