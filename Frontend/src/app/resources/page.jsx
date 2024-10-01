"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import { debounce } from "@/utils/common";

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
      console.error("🚀 ~ file: page.jsx:35 ~ fetchResources ~ error:", error);
      toast.error("Error fetching resources, Please try again");
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
      debouncedFetchResources(searchTerm, page, true); // Append resources when page > 1
    }
  }, [page]);

  useEffect(() => {
    setPage(1); // Reset page when search term changes
    setResources([]);
    debouncedFetchResources(searchTerm, 1, false); // Fetch fresh resources on search
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
    <div className="bg-white dark:bg-gray-800 mx-auto p-6">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Resources
        </h1>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="h-[500px] overflow-y-auto">
          {resources?.length > 0 ? (
            <ul className="space-y-6">
              {resources.map((resource, index) => (
                <li
                  key={resource.id}
                  ref={index === resources.length - 1 ? lastResourceRef : null}
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
                      <span
                        key={tag}
                        className="bg-blue-100 dark:bg-gray-900 rounded-lg px-2"
                      >
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

          {loadingMore && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-6">
              Loading more resources...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
