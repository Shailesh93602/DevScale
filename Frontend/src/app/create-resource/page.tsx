'use client';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import { IResource } from '@/constants';
import { useAxiosGet } from '@/hooks/useAxios';

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<IResource[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [getUnpublishedTopics] = useAxiosGet<{ topics: IResource[] }>(
    '/topics/unpublished',
  );

  const dispatch = useDispatch();

  const fetchResources = async () => {
    dispatch(showLoader('fetching resources'));
    try {
      const response = await getUnpublishedTopics();
      const data = response.data;
      setResources(data?.topics ?? []);
      setAvailableTags([
        ...new Set(
          data?.topics?.flatMap(
            (resource: { tags: string[] }) => resource.tags,
          ),
        ),
      ] as string[]);
    } catch (error) {
      toast.error('Something went wrong, Please try again!');
      console.error(error);
    }
    dispatch(hideLoader('fetching resources'));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTagSelection = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag],
    );
  };

  const filteredResources = resources?.filter(
    (resource) =>
      (resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (selectedTags.length === 0 ||
        selectedTags.some((tag) => resource.tags?.includes(tag))),
  );

  return (
    <>
      <Navbar />
      <div className="mx-auto bg-white p-6 dark:bg-gray-800">
        <div className="rounded-lg bg-blue-50 p-6 shadow-md dark:bg-gray-900">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Available Topics
          </h1>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={handleSearch}
            className="mb-6 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="mb-6">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelection(tag)}
                className={`m-1 rounded border p-2 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {filteredResources?.length > 0 ? (
            <ul className="space-y-6">
              {filteredResources.map((resource) => (
                <li
                  key={resource.id}
                  className="rounded-lg bg-gray-50 p-6 shadow transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {resource.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {resource.description}
                  </p>
                  <a
                    href={`/create-resource/${resource.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-blue-500 hover:underline dark:text-blue-400"
                  >
                    Add Article
                  </a>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {resource.category}
                  </span>
                  <div className="mt-2">
                    {resource.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="mr-1 inline-block rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-100"
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
    </>
  );
}
