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
// import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";

// import { calsans } from "@/fonts/calsans";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";


export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);

  // const { authenticated } = useContext(UserContext);
  const router = useRouter();

  // useEffect(() => {
  //   if (!authenticated) {
  //     router.push("/u/login");
  //   }
  // }, [authenticated, router]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchResources = async () => {
      dispatch(showLoader());
      try {
        const response = await fetchData("GET", "/resources");
        const data = response.data;
        setResources(data.resources);
      } catch (error) {
        console.log("🚀 ~ file: page.jsx:116 ~ fetchResources ~ error:", error);
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
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const programmingInfo = [
    {
      title: "JavaScript",
      description: (
        <>
          <p>
            JavaScript is a versatile programming language primarily used for web development. It allows developers to create dynamic, interactive web pages and is essential for front-end and back-end development using frameworks like React, Angular, or Node.js.
          </p>
          <p>
            JavaScript is widely adopted due to its flexibility, large ecosystem of libraries and frameworks, and compatibility with all major web browsers. It supports event-driven, functional, and imperative programming styles.
          </p>
          <p>
            JavaScript's asynchronous capabilities with Promises and async/await make it suitable for handling asynchronous operations, such as fetching data from servers or handling user events without blocking the main thread.
          </p>
        </>
      ),
      badge: "Interview",
      image:
        "https://images.unsplash.com/photo-1499951360443-4f2e8f2de26f?auto=format&fit=crop&q=80&w=1920&h=1080",
    },
    {
      title: "React",
      description: (
        <>
          <p>
            React is a JavaScript library for building user interfaces, developed and maintained by Facebook. It's used to create reusable UI components and efficiently manage the state of web applications.
          </p>
          <p>
            React uses a component-based architecture, where UI elements are encapsulated into components that manage their own state and can be composed to build complex UIs. This approach promotes code reusability and maintainability.
          </p>
          <p>
            React utilizes a virtual DOM (Document Object Model) for optimal rendering performance by updating only the necessary parts of the UI when data changes. It supports JSX (JavaScript XML) syntax for writing HTML within JavaScript code.
          </p>
        </>
      ),
      badge: "Interview",
      image:
        "https://images.unsplash.com/photo-1512485694743-8f29055c05ee?auto=format&fit=crop&q=80&w=1920&h=1080",
    },
    {
      title: "Python",
      description: (
        <>
          <p>
            Python is a high-level, interpreted programming language known for its simplicity and readability. It's widely used in various domains such as web development, data science, artificial intelligence, scientific computing, and automation.
          </p>
          <p>
            Python's syntax emphasizes code readability with its use of whitespace indentation. It has a large standard library and supports multiple programming paradigms including procedural, object-oriented, and functional programming.
          </p>
          <p>
            Python's popularity is driven by its simplicity, extensive community support, and the availability of third-party libraries like NumPy (for numerical computing), Pandas (for data manipulation), and TensorFlow (for machine learning). It's considered a beginner-friendly language yet powerful enough for complex applications.
          </p>
        </>
      ),
      badge: "Interview",
      image:
        "https://images.unsplash.com/photo-1495745966610-2a67f2297f4b?auto=format&fit=crop&q=80&w=1920&h=1080",
    },

  ];

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



        {/* {filteredResources?.length > 0 ? (
          <ul className="space-y-6">
            {filteredResources.map((resource, index) => (
              <li
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
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
        )} */}


      </div>
    </div>
  );
}
