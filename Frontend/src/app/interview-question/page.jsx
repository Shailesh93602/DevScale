"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

const reactInterviewQuestions = [
  {
    category: "React Interview Questions",
    questions: [
      {
        id: "react-1",
        question: "What is ReactJS?",
        answer: {
          introduction:
            "ReactJS is a popular JavaScript library for building user interfaces, particularly single-page applications.",
          points: [
            {
              title: "Component-Based",
              description:
                "React allows you to build encapsulated components that manage their own state, then compose them to make complex UIs.",
            },
            {
              title: "Declarative",
              description:
                "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.",
            },
            {
              title: "Learn Once, Write Anywhere",
              description:
                "You can develop new features in React without rewriting existing code. React can also render on the server using Node and power mobile apps using React Native.",
            },
          ],
          conclusion:
            "React's efficiency, flexibility, and component-based architecture make it a powerful tool for building modern web applications.",
        },
      },
      {
        id: "react-2",
        question: "Explain the building blocks of React",
        answer: {
          introduction:
            "React applications are built using several key building blocks:",
          points: [
            {
              title: "Components",
              description:
                "The core building blocks of React. They are reusable pieces of the UI that combine HTML, CSS, and JavaScript.",
            },
            {
              title: "JSX",
              description:
                "A syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
            },
            {
              title: "Props",
              description:
                "Short for properties, props are how components receive data and configurations from their parent components.",
            },
            {
              title: "State",
              description:
                "An object that holds data that may change over time and affects the component's rendering.",
            },
            {
              title: "Hooks",
              description:
                "Functions that let you use state and other React features in functional components.",
            },
          ],
          conclusion:
            "These building blocks work together to create efficient, reusable, and maintainable React applications.",
        },
      },
      {
        id: "react-3",
        question: "Explain props and state in React with differences",
        answer: {
          introduction:
            "Props and state are both used to manage data in React, but they serve different purposes and have distinct characteristics:",
          points: [
            {
              title: "Props",
              description:
                "Short for properties, props are used to pass data from parent to child components. They are read-only and cannot be modified by the component receiving them.",
            },
            {
              title: "State",
              description:
                "State is used to manage data within a component. It can be modified using the setState method and when it changes, it triggers a re-render of the component.",
            },
            {
              title: "Mutability",
              description:
                "Props are immutable (cannot be changed), while state is mutable (can be changed).",
            },
            {
              title: "Component Type",
              description:
                "Props can be used in both functional and class components, while state traditionally was only used in class components (now functional components can use state with hooks).",
            },
            {
              title: "Data Flow",
              description:
                "Props facilitate top-down data flow, while state is used for internal component data management.",
            },
          ],
          conclusion:
            "Understanding the difference between props and state is crucial for effective data management and component communication in React applications.",
        },
      },
      {
        id: "react-4",
        question: "What is virtual DOM in React?",
        answer: {
          introduction:
            "The Virtual DOM (Document Object Model) is a programming concept used in React to optimize rendering performance.",
          points: [
            {
              title: "Definition",
              description:
                "It's a lightweight copy of the actual DOM in memory, representing the UI of your application.",
            },
            {
              title: "Functioning",
              description:
                "When the state of an application changes, the virtual DOM gets updated instead of the real DOM.",
            },
            {
              title: "Diffing",
              description:
                "React then compares the virtual DOM with a pre-update version to compute the minimum number of operations needed to update the real DOM.",
            },
            {
              title: "Batching",
              description:
                "Multiple changes to the virtual DOM are batched together, reducing the number of updates to the real DOM.",
            },
            {
              title: "Performance",
              description:
                "This process significantly improves performance as manipulating the actual DOM is slower than operations on JavaScript objects.",
            },
          ],
          conclusion:
            "The Virtual DOM allows React to minimize direct manipulation of the DOM, resulting in faster updates and improved application performance.",
        },
      },
      {
        id: "react-5",
        question: "What are components and their types in React?",
        answer: {
          introduction:
            "Components are the building blocks of React applications. They are reusable pieces of code that return React elements to be rendered on the screen.",
          points: [
            {
              title: "Functional Components",
              description:
                "Also known as stateless components, these are JavaScript functions that accept props and return React elements. With the introduction of Hooks, they can now also manage state.",
            },
            {
              title: "Class Components",
              description:
                "These are ES6 classes that extend from React.Component. They can hold and manage local state and have access to lifecycle methods.",
            },
            {
              title: "Pure Components",
              description:
                "Similar to class components, but they automatically implement shouldComponentUpdate() with a shallow prop and state comparison.",
            },
            {
              title: "Higher-Order Components (HOC)",
              description:
                "These are functions that take a component and return a new component with some added functionality.",
            },
            {
              title: "Render Props Components",
              description:
                "These components use a prop whose value is a function to share code between components.",
            },
          ],
          conclusion:
            "Understanding these different types of components allows developers to choose the most appropriate one for their specific use case, leading to more efficient and maintainable React applications.",
        },
      },
      {
        id: "react-6",
        question: "What is a key in React?",
        answer: {
          introduction:
            "A key is a special attribute you need to include when creating lists of elements in React.",
          points: [
            {
              title: "Purpose",
              description:
                "Keys help React identify which items have changed, are added, or are removed in a list.",
            },
            {
              title: "Uniqueness",
              description:
                "Keys must be unique among siblings. They don't need to be globally unique.",
            },
            {
              title: "Performance",
              description:
                "Keys give elements a stable identity, which helps in efficient updating of the user interface.",
            },
            {
              title: "Usage",
              description:
                "Keys should be given to the elements inside the array to give the elements a stable identity.",
            },
            {
              title: "Best Practice",
              description:
                "It's best to use a unique identifier from your data as the key, like an ID. Only use the index as a last resort if you have no stable IDs for rendered items.",
            },
          ],
          conclusion:
            "Proper use of keys is crucial for React's reconciliation process and can significantly impact the performance of your application, especially when dealing with dynamic lists.",
        },
      },
      {
        id: "react-7",
        question: "Explain the difference between React and Angular",
        answer: {
          introduction:
            "React and Angular are both popular for building web applications, but they have several key differences:",
          points: [
            {
              title: "Type",
              description:
                "React is a library focused on building UI components, while Angular is a full-fledged framework.",
            },
            {
              title: "Learning Curve",
              description:
                "React has a gentler learning curve compared to Angular, which has a steeper learning curve due to its more complex architecture.",
            },
            {
              title: "Language",
              description:
                "React uses JavaScript with JSX, while Angular uses TypeScript.",
            },
            {
              title: "DOM",
              description:
                "React uses a virtual DOM for better performance, while Angular uses a real DOM.",
            },
            {
              title: "Data Binding",
              description:
                "React uses one-way data binding, while Angular supports both one-way and two-way data binding.",
            },
            {
              title: "Performance",
              description:
                "React generally offers better performance for larger applications due to its virtual DOM.",
            },
          ],
          conclusion:
            "The choice between React and Angular often depends on project requirements, team expertise, and personal preference.",
        },
      },
      {
        id: "react-8",
        question: "Explain the use of render method in React",
        answer: {
          introduction:
            "The render method is a crucial part of React components, responsible for describing what the UI should look like.",
          points: [
            {
              title: "Purpose",
              description:
                "It returns the JSX (or elements) that will be rendered to the DOM.",
            },
            {
              title: "Pure Function",
              description:
                "The render method should be pure, meaning it doesn't modify component state, returns the same result each time it's invoked, and doesn't directly interact with the browser.",
            },
            {
              title: "Frequency",
              description:
                "It's called every time a component's state or props change.",
            },
            {
              title: "JSX",
              description:
                "While it typically returns JSX, it can also return arrays, strings, numbers, or null.",
            },
            {
              title: "Conditional Rendering",
              description:
                "You can use conditional statements inside the render method to render different elements based on the component's state or props.",
            },
          ],
          conclusion:
            "The render method is essential for defining the structure of your React components and how they should appear based on their current state and props.",
        },
      },
      {
        id: "react-9",
        question: "What is webpack?",
        answer: {
          introduction:
            "Webpack is a static module bundler for modern JavaScript applications.",
          points: [
            {
              title: "Module Bundling",
              description:
                "It takes modules with dependencies and generates static assets representing those modules.",
            },
            {
              title: "Entry",
              description:
                "Webpack uses an entry point to know which module to start bundling from.",
            },
            {
              title: "Output",
              description:
                "It generates one or more bundles as output, which are static assets to serve your content from.",
            },
            {
              title: "Loaders",
              description:
                "Webpack uses loaders to process different types of files and convert them into valid modules.",
            },
            {
              title: "Plugins",
              description:
                "Plugins can be used to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.",
            },
          ],
          conclusion:
            "Webpack is crucial in modern web development for bundling JavaScript files for usage in a browser, but it's also capable of transforming, bundling, or packaging just about any resource or asset.",
        },
      },
      {
        id: "react-10",
        question: "What is higher-order component in React?",
        answer: {
          introduction:
            "A Higher-Order Component (HOC) is an advanced technique in React for reusing component logic.",
          points: [
            {
              title: "Definition",
              description:
                "It's a function that takes a component and returns a new component with some additional functionality.",
            },
            {
              title: "Purpose",
              description:
                "HOCs allow you to reuse component logic across multiple components without modifying their implementation.",
            },
            {
              title: "Usage",
              description:
                "They're commonly used for cross-cutting concerns like logging, access control, or data fetching.",
            },
            {
              title: "Pure Function",
              description:
                "HOCs should be pure functions with no side-effects, not modifying the input component.",
            },
            {
              title: "Composition",
              description:
                "They follow the principle of composition over inheritance to extend component functionality.",
            },
          ],
          conclusion:
            "Higher-Order Components are a powerful pattern in React for sharing behavior between components, enhancing code reuse and modularity.",
        },
      },
      {
        id: "react-11",
        question: "Explain one way data binding in React",
        answer: {
          introduction:
            "One-way data binding, also known as unidirectional data flow, is a core concept in React's design philosophy.",
          points: [
            {
              title: "Definition",
              description:
                "It means that data in React flows in a single direction, from parent components to child components.",
            },
            {
              title: "State Management",
              description:
                "The state is usually kept in parent components and passed down to children as props.",
            },
            {
              title: "Updating Data",
              description:
                "To change data, child components don't modify props directly but can request changes through callbacks passed from parent components.",
            },
            {
              title: "Predictability",
              description:
                "This pattern makes the data flow more predictable and easier to understand, as it's clear where the data comes from and how it can be changed.",
            },
            {
              title: "Debugging",
              description:
                "One-way data binding makes it easier to track where data changes are coming from, simplifying the debugging process.",
            },
          ],
          conclusion:
            "One-way data binding in React promotes a clean and maintainable architecture by enforcing a clear and predictable data flow throughout the application.",
        },
      },
      {
        id: "react-12",
        question: "What is react router?",
        answer: {
          introduction:
            "React Router is a standard library for routing in React applications.",
          points: [
            {
              title: "Purpose",
              description:
                "It enables navigation among views in a React application, allowing for a single-page application experience.",
            },
            {
              title: "Components",
              description:
                "React Router provides components like BrowserRouter, Route, Link, and Switch for declarative routing.",
            },
            {
              title: "Dynamic Routing",
              description:
                "It allows for dynamic route matching and can generate dynamic URLs based on parameters.",
            },
            {
              title: "Nested Routing",
              description:
                "React Router supports nested routes, allowing for complex layouts and component hierarchies.",
            },
            {
              title: "History Management",
              description:
                "It uses the HTML5 history API to keep the UI in sync with the URL, allowing for browser navigation features.",
            },
          ],
          conclusion:
            "React Router is essential for building single-page applications in React, providing a declarative way to define the routing structure of your application.",
        },
      },
      {
        id: "react-13",
        question: "What are hooks in React?",
        answer: {
          introduction:
            "Hooks are a feature introduced in React 16.8 that allow you to use state and other React features without writing a class.",
          points: [
            {
              title: "State in Functional Components",
              description:
                "Hooks like useState allow functional components to have local state.",
            },
            {
              title: "Side Effects",
              description:
                "The useEffect hook allows you to perform side effects in functional components.",
            },
            {
              title: "Context",
              description:
                "useContext hook provides an easier way to consume context in functional components.",
            },
            {
              title: "Custom Hooks",
              description:
                "You can create your own hooks to reuse stateful logic between different components.",
            },
            {
              title: "Rules",
              description:
                "Hooks come with rules: only call them at the top level and only call them from React functions.",
            },
          ],
          conclusion:
            "Hooks provide a more direct API to React concepts like props, state, context, refs and lifecycle, making it easier to use React's features and organize logic in components.",
        },
      },
    ],
  },
];
const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h1 className="text-5xl font-extrabold text-center text-indigo-800 dark:text-indigo-300 mb-12 tracking-tight">
          Interview Questions
        </h1>
        {reactInterviewQuestions.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">
              {category.category}
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-6">
              {category.questions.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-indigo-100 dark:border-gray-700"
                >
                  <AccordionTrigger className="px-8 py-6 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-left">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 py-6 bg-indigo-50 dark:bg-gray-700">
                    <div className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      <p className="mb-4">{item.answer.introduction}</p>
                      <ul className="list-disc pl-5 space-y-2 mb-4">
                        {item.answer.points.map((point, index) => (
                          <li key={index}>
                            <strong>{point.title}:</strong> {point.description}
                          </li>
                        ))}
                      </ul>
                      <p>{item.answer.conclusion}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
