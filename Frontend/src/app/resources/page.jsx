// "use client";
// import { useContext, useEffect, useState } from 'react';
// import './styles.css';
// import { UserContext } from '../../context/UserContext';
// import { useRouter } from 'next/navigation';

// export default function ResourcesPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [resources, setResources] = useState([
//     {
//       title: 'Introduction to Programming',
//       description: 'A beginner-friendly course to learn programming basics.',
//       link: 'https://example.com/intro-to-programming',
//       category: 'Courses'
//     },
//     {
//       title: 'JavaScript Documentation',
//       description: 'Comprehensive guide to JavaScript language and its features.',
//       link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
//       category: 'Documentation'
//     },
//     {
//       title: 'CSS Tricks',
//       description: 'Tips and tricks for mastering CSS.',
//       link: 'https://css-tricks.com',
//       category: 'Articles'
//     }
//   ]);

//   const { authenticated } = useContext(UserContext);
//   const router = useRouter();

//   useEffect(() => {
//     if (!authenticated) {
//       router.push("/u/login");
//     }
//   })

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const filteredResources = resources.filter((resource) =>
//     resource.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="container mx-auto p-4">
//       <div className="bg-light shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-4">Resources</h1>
//         <input
//           type="text"
//           placeholder="Search resources..."
//           value={searchTerm}
//           onChange={handleSearch}
//           className="w-full p-2 mb-6 border border-gray-300 rounded-md"
//         />

//         {filteredResources.length > 0 ? (
//           <ul className="space-y-4">
//             {filteredResources.map((resource, index) => (
//               <li key={index} className="bg-gray-100 p-4 rounded-md shadow">
//                 <h2 className="text-xl font-semibold text-gray-900">{resource.title}</h2>
//                 <p className="text-gray-700">{resource.description}</p>
//                 <a
//                   href={resource.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 hover:underline mt-2 block"
//                 >
//                   Visit Resource
//                 </a>
//                 <span className="text-sm text-gray-500">{resource.category}</span>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-gray-700">No resources found.</p>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([
    {
      title: "Introduction to Programming",
      description: "A beginner-friendly course to learn programming basics.",
      link: "https://example.com/intro-to-programming",
      category: "Courses",
    },
    {
      title: "JavaScript Documentation",
      description:
        "Comprehensive guide to JavaScript language and its features.",
      link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      category: "Documentation",
    },
    {
      title: "CSS Tricks",
      description: "Tips and tricks for mastering CSS.",
      link: "https://css-tricks.com",
      category: "Articles",
    },
  ]);

  const { authenticated } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/u/login");
    }
  }, [authenticated, router]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Resources
        </h1>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {filteredResources.length > 0 ? (
          <ul className="space-y-6">
            {filteredResources.map((resource, index) => (
              <li
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {resource.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {resource.description}
                </p>
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:underline mt-2 block"
                >
                  Visit Resource
                </a>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {resource.category}
                </span>
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
