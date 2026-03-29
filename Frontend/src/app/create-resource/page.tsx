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

  const [getUnpublishedTopics] = useAxiosGet<IResource[]>(
    '/topics/unpublished',
  );

  const dispatch = useDispatch();

  const fetchResources = async () => {
    dispatch(showLoader('fetching resources'));
    try {
      const response = await getUnpublishedTopics();
      const data = response.data;
      setResources(data ?? []);
      setAvailableTags([
        ...new Set(
          data?.flatMap((resource: { tags: string[] }) => resource.tags),
        ),
      ] as string[]);
    } catch (error) {
      toast.error('Something went wrong, Please try again!');
      console.error(error);
    }
    dispatch(hideLoader('fetching resources'));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="mx-auto bg-background p-6">
        <div className="rounded-lg bg-card p-6 text-card-foreground shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-foreground">
            Available Topics
          </h1>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={handleSearch}
            className="mb-6 w-full rounded-md border border-input bg-input p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mb-6">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelection(tag)}
                className={`m-1 rounded border p-2 ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
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
                  className="rounded-lg bg-muted/20 p-6 shadow transition-shadow duration-200 hover:shadow-lg"
                >
                  <h2 className="text-2xl font-semibold text-foreground">
                    {resource.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {resource.description}
                  </p>
                  <a
                    href={`/create-resource/${resource.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-primary hover:underline"
                  >
                    Add Article
                  </a>
                  <span className="text-sm text-muted-foreground">
                    {resource.category}
                  </span>
                  <div className="mt-2">
                    {resource.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="mr-1 inline-block rounded-full bg-muted px-2 py-1 text-xs text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No topics found.</p>
          )}
        </div>
      </div>
    </>
  );
}
