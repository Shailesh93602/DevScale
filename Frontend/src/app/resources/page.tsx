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
import { Search, Book, Tag } from "lucide-react";
import { HoverBorderGradient } from "@/components/hover-border-gradient";
import { AceternityLogo } from "@/components/AceternityLogo";

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState<
    {
      id: string;
      name: string;
      description: string;
      category: string;
      tags: string[];
    }[]
  >([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const dispatch = useDispatch();
  const observerRef = useRef<IntersectionObserver>(null);

  const fetchResources = async (
    searchTerm: string,
    page: number,
    isAppending = false
  ) => {
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
        (searchTerm: string, page: number, isAppending?: boolean) =>
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
    (node: HTMLDivElement) => {
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
    <div className="">
      <div className="p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Discover Resources
          </h1>
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 pr-4 rounded-full border border-border bg-lightSecondary focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 ease-in-out"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-grayText" />
          </div>

          {resources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource, index) => (
                <div
                  key={resource.id}
                  ref={index === resources.length - 1 ? lastResourceRef : null}
                  className="flex flex-col items-end justify-between bg-lightSecondary rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 p-4"
                >
                  <div className="self-start">
                    <h2 className="text-2xl font-semibold mb-2 flex items-center">
                      <Book className="mr-2" size={24} />
                      {resource.name}
                    </h2>
                    <p className="text-grayText mb-4">{resource.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-primaryLight text-primary rounded-full px-3 py-1 text-sm font-medium flex items-center"
                        >
                          <Tag size={14} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-grayText">
                        {resource.category}
                      </span>
                    </div>
                  </div>

                  <HoverBorderGradient
                    href={`/resources/${resource.id}`}
                    containerClassName="rounded-full"
                    as="button"
                    className="bg-primary hover:bg-primary2 flex items-center self-end space-x-2"
                  >
                    <AceternityLogo />
                    <span>View Resource</span>
                  </HoverBorderGradient>
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
                      Try adjusting your search or browse our categories for
                      more options.
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
    </div>
  );
};

export default ResourcesPage;
