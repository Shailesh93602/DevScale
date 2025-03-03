export type RoadmapData = {
  title: string;
  description: string;
  tags: string;
  mainConcepts: {
    name: string;
    description: string;
    order: number;
    subjects: {
      name: string;
      description: string;
      order: number;
      topics: {
        name: string;
        description: string;
        order: number;
      }[];
    }[];
  }[];
};

export const roadmapCategories = [
  'Frontend',
  'Backend',
  'FullStack',
  'Node',
  'React',
  'Python',
  'MachineLearning',
  'DataAnalysis',
];

export const roadmaps: RoadmapData[] = [
  {
    title: 'Full Stack Web Development',
    description:
      'A comprehensive roadmap to become a Full Stack Web Developer.',
    tags: 'Frontend,Backend,FullStack,Node,Rea',
    mainConcepts: [
      {
        name: 'Frontend Development',
        description: 'Building the client-side of web applications.',
        order: 1,
        subjects: [
          {
            name: 'HTML',
            description: 'Learn the basics of HTML, the backbone of web pages.',
            order: 1,
            topics: [
              {
                name: 'HTML Basics',
                description:
                  'Introduction to HTML, tags, elements, and basic structure of web pages.',
                order: 1,
              },
              {
                name: 'HTML Document Structure',
                description:
                  'Understanding the structure of an HTML document including DOCTYPE, head, body, and meta tags.',
                order: 2,
              },
              {
                name: 'Text Formatting',
                description:
                  'Formatting text using HTML elements such as bold, italics, underline, and more.',
                order: 3,
              },
              {
                name: 'Links and Navigation',
                description:
                  'Creating hyperlinks and building navigation menus using anchor tags.',
                order: 4,
              },
              {
                name: 'Images and Multimedia',
                description:
                  'Embedding images, videos, and audio into your web pages using HTML.',
                order: 5,
              },
              {
                name: 'Forms and Input',
                description:
                  'Building forms and handling various input types such as text fields, buttons, checkboxes, and radio buttons.',
                order: 6,
              },
              {
                name: 'HTML Tables',
                description:
                  'Creating and styling HTML tables for displaying tabular data.',
                order: 7,
              },
              {
                name: 'HTML Lists',
                description:
                  'Creating ordered, unordered, and definition lists for structuring content.',
                order: 8,
              },
              {
                name: 'Semantic HTML',
                description:
                  'Using semantic HTML elements like header, footer, article, and section to enhance content structure.',
                order: 9,
              },
              {
                name: 'HTML5 Features',
                description:
                  'Exploring new HTML5 features such as the video, audio, and canvas elements.',
                order: 10,
              },
              {
                name: 'HTML Forms Advanced',
                description:
                  'Working with advanced form controls like date pickers, sliders, and file uploads.',
                order: 11,
              },
              {
                name: 'Responsive Design with HTML',
                description:
                  'Using HTML along with CSS and media queries for responsive and mobile-friendly design.',
                order: 12,
              },
              {
                name: 'HTML Accessibility',
                description:
                  'Making web pages accessible using ARIA attributes and best practices for inclusive design.',
                order: 13,
              },
              {
                name: 'HTML Best Practices',
                description:
                  'Writing clean, maintainable, and efficient HTML code following industry best practices.',
                order: 14,
              },
              {
                name: 'HTML Scripting',
                description:
                  'Embedding and linking JavaScript in HTML to add interactivity to web pages.',
                order: 15,
              },
              {
                name: 'HTML Metadata and SEO',
                description:
                  'Optimizing HTML using metadata, open graph tags, and structured data for better SEO and social sharing.',
                order: 16,
              },
              {
                name: 'HTML & CSS Integration',
                description:
                  'Integrating HTML with CSS for layouts, styles, and visual enhancements.',
                order: 17,
              },
              {
                name: 'Document Object Model (DOM)',
                description:
                  'Understanding the DOM and how browsers interpret HTML documents as a tree structure.',
                order: 18,
              },
              {
                name: 'HTML for Web Applications',
                description:
                  'Leveraging HTML in modern web applications and frameworks like React, Angular, and Vue.js.',
                order: 19,
              },
              {
                name: 'HTML for Email',
                description:
                  'Creating HTML emails with inline CSS, tables, and best practices for responsive email design.',
                order: 20,
              },
              {
                name: 'HTML for Forms with Validation',
                description:
                  'Implementing form validation using HTML5 attributes like required, pattern, and maxLength.',
                order: 21,
              },
              {
                name: 'HTML for SEO and Performance',
                description:
                  'Optimizing HTML for search engine ranking and web performance, including best practices for loading times.',
                order: 22,
              },
              {
                name: 'HTML for Security',
                description:
                  'Implementing security best practices like preventing XSS attacks, secure input handling, and safe linking.',
                order: 23,
              },
              {
                name: 'Microdata and HTML',
                description:
                  'Using microdata for structured content to enhance SEO and integration with search engines.',
                order: 24,
              },
              {
                name: 'HTML Templates',
                description:
                  'Understanding and using the `<template>` element for reusable HTML fragments and client-side templating.',
                order: 25,
              },
              {
                name: 'HTML History & Evolution',
                description:
                  'Exploring the evolution of HTML from its inception to modern-day HTML5 and its impact on web development.',
                order: 26,
              },
              {
                name: 'HTML Advanced Topics',
                description:
                  'Exploring advanced HTML concepts like custom data attributes, inline SVG, and the `<canvas>` element for drawing graphics.',
                order: 27,
              },
              {
                name: 'HTML Entities',
                description:
                  'Understanding special characters and their HTML representations.',
                order: 28,
              },
              {
                name: 'HTML Comments',
                description:
                  'How to write comments in HTML and their best practices.',
                order: 29,
              },
              {
                name: 'Forms and Input Types',
                description:
                  'Detailed exploration of various form elements and input types (e.g., file, range, color).',
                order: 30,
              },
              {
                name: 'HTML5 Form Validation',
                description:
                  'Client-side form validation techniques using HTML5 attributes (e.g., required, pattern).',
                order: 31,
              },
              {
                name: 'HTML and CSS Integration',
                description:
                  'Best practices for integrating CSS with HTML, including inline styles, internal stylesheets, and external stylesheets.',
                order: 32,
              },
              {
                name: 'HTML and JavaScript Integration',
                description:
                  'Understanding how to interact with JavaScript through HTML elements and events.',
                order: 33,
              },
              {
                name: 'Web Accessibility (WCAG Guidelines)',
                description:
                  'In-depth discussion on Web Content Accessibility Guidelines (WCAG) and how to implement them in HTML.',
                order: 34,
              },
              {
                name: 'Responsive Web Design',
                description:
                  'Techniques for building responsive web pages using HTML and CSS.',
                order: 35,
              },
              {
                name: 'HTML and SEO Best Practices',
                description:
                  'How HTML structure affects SEO, including the use of headings, metadata, and semantic HTML.',
                order: 36,
              },
              {
                name: 'Microformats',
                description:
                  'Overview of microformats and how they differ from microdata for adding semantic information to HTML.',
                order: 37,
              },
              {
                name: 'Using SVG in HTML',
                description:
                  'How to embed Scalable Vector Graphics (SVG) in HTML and their advantages.',
                order: 38,
              },
              {
                name: 'HTML5 Web Components',
                description:
                  'Understanding custom elements, shadow DOM, and HTML templates.',
                order: 39,
              },
              {
                name: 'Internationalization (i18n) and Localization (l10n)',
                description:
                  'Techniques for making HTML documents adaptable to different languages and regions.',
                order: 40,
              },
              {
                name: 'Progressive Enhancement and Graceful Degradation',
                description:
                  'Strategies for building web applications that work on older browsers while leveraging new features.',
                order: 41,
              },
              {
                name: 'HTML and CSS Frameworks',
                description:
                  'Overview of popular HTML/CSS frameworks (e.g., Bootstrap, Foundation) and their usage.',
                order: 42,
              },
              {
                name: 'HTML Email Design',
                description:
                  'Techniques and best practices for designing responsive HTML emails.',
                order: 43,
              },
              {
                name: 'Server-Sent Events (SSE)',
                description:
                  'Understanding how to use HTML with SSE for real-time updates.',
                order: 44,
              },
              {
                name: 'Browser Developer Tools',
                description:
                  'Utilizing browser developer tools for inspecting and debugging HTML/CSS.',
                order: 45,
              },
              {
                name: 'HTML in Web Applications',
                description:
                  'The role of HTML in modern web applications and how it interacts with backend technologies.',
                order: 46,
              },
              {
                name: 'Content Security Policy (CSP)',
                description:
                  'Understanding how to implement CSP in HTML to enhance security.',
                order: 47,
              },
              {
                name: 'Using Meta Tags Effectively',
                description:
                  'Overview of essential meta tags for SEO, social sharing, and viewport settings.',
                order: 48,
              },
              {
                name: 'HTML Performance Optimization',
                description:
                  'Techniques for optimizing HTML for performance, including minimizing HTTP requests and optimizing assets.',
                order: 49,
              },
              {
                name: 'Accessibility Features for Forms',
                description:
                  'Detailed strategies for making forms accessible, including labeling and focus management.',
                order: 50,
              },
              {
                name: 'HTML and RESTful APIs',
                description:
                  'How to use HTML to interact with RESTful APIs, including AJAX and fetch.',
                order: 51,
              },
              {
                name: 'Static Site Generators',
                description:
                  'Understanding how static site generators work and their relation to HTML.',
                order: 52,
              },
            ],
          },
          {
            name: 'CSS',
            description: 'Learn how to style web pages using CSS.',
            order: 2,
            topics: [
              {
                name: 'CSS Basics',
                description:
                  'Introduction to CSS syntax, selectors, properties, and values.',
                order: 1,
              },
              {
                name: 'CSS Box Model',
                description:
                  'Understanding the box model including margin, padding, border, and content.',
                order: 2,
              },
              {
                name: 'CSS Positioning',
                description:
                  'Learn about different positioning methods like static, relative, absolute, fixed, and sticky.',
                order: 3,
              },
              {
                name: 'CSS Display',
                description:
                  'Understanding block, inline, inline-block, and other display properties.',
                order: 4,
              },
              {
                name: 'CSS Flexbox',
                description:
                  'Layouts with Flexbox, including flex containers, flex items, and common use cases.',
                order: 5,
              },
              {
                name: 'CSS Grid',
                description:
                  'Layouts with CSS Grid, creating responsive grid systems, and grid items.',
                order: 6,
              },
              {
                name: 'CSS Layout Techniques',
                description:
                  'Learn how to create layouts using floats, Flexbox, CSS Grid, and positioning.',
                order: 7,
              },
              {
                name: 'CSS Selectors and Specificity',
                description:
                  'Master CSS selectors, combinators, pseudo-classes, pseudo-elements, and understanding specificity.',
                order: 8,
              },
              {
                name: 'CSS Units and Sizing',
                description:
                  'Using absolute and relative units like px, em, rem, %, vh, vw, and calc() for dynamic sizing.',
                order: 9,
              },
              {
                name: 'CSS Colors and Backgrounds',
                description:
                  'Working with color properties, gradients, background images, and background positioning.',
                order: 10,
              },
              {
                name: 'CSS Typography',
                description:
                  'Styling text with fonts, line height, letter spacing, text alignment, and web fonts.',
                order: 11,
              },
              {
                name: 'CSS Borders, Shadows, and Outlines',
                description:
                  'Creating visual elements using border-radius, box-shadow, and other decorative properties.',
                order: 12,
              },
              {
                name: 'CSS Transitions and Animations',
                description:
                  'Creating smooth transitions, animations using keyframes, and leveraging transform properties.',
                order: 13,
              },
              {
                name: 'CSS Variables (Custom Properties)',
                description:
                  'Introduction to CSS variables, how to define and use them, and their scope in styling.',
                order: 14,
              },
              {
                name: 'CSS Preprocessors',
                description:
                  'Working with preprocessors like Sass and Less for advanced features like nesting and mixins.',
                order: 15,
              },
              {
                name: 'CSS Responsive Design',
                description:
                  'Using media queries and techniques for making web designs responsive to different screen sizes.',
                order: 16,
              },
              {
                name: 'CSS Frameworks and Libraries',
                description:
                  'Using popular CSS frameworks such as Bootstrap and Tailwind CSS for faster development.',
                order: 17,
              },
              {
                name: 'CSS for Accessibility',
                description:
                  'Improving accessibility with focus styles, ARIA attributes, and screen reader-compatible styles.',
                order: 18,
              },
              {
                name: 'CSS Variables and Mixins',
                description:
                  'Defining reusable code with CSS variables and Sass mixins to enhance code reuse and maintenance.',
                order: 19,
              },
              {
                name: 'CSS for Print',
                description:
                  'Creating print-friendly styles using media queries targeted for print media.',
                order: 20,
              },
              {
                name: 'Advanced CSS Features',
                description:
                  'Explore advanced CSS features such as CSS Grid areas, clip paths, masks, and filter effects.',
                order: 21,
              },
              {
                name: 'CSS Transforms',
                description:
                  'Rotating, scaling, and skewing elements using CSS transforms for creative visual effects.',
                order: 22,
              },
              {
                name: 'CSS for Web Performance',
                description:
                  'Optimizing CSS for performance, including minimizing CSS file sizes and using critical CSS.',
                order: 23,
              },
              {
                name: 'CSS Architecture',
                description:
                  'Organizing CSS at scale using methodologies like BEM (Block, Element, Modifier), ITCSS, and Atomic Design.',
                order: 24,
              },
              {
                name: 'CSS Grid vs Flexbox',
                description:
                  'Comparison of CSS Grid and Flexbox and when to use one over the other in real-world scenarios.',
                order: 25,
              },
              {
                name: 'CSS for Modern Web Applications',
                description:
                  'Leveraging CSS in modern web applications with frameworks like React, Vue.js, and Angular.',
                order: 26,
              },
              {
                name: 'CSS Best Practices',
                description:
                  'Learn CSS best practices, including code organization, naming conventions, and performance optimizations.',
                order: 27,
              },
              {
                name: 'CSS Shorthand Properties',
                description:
                  'Using shorthand properties to write efficient CSS code for margins, padding, borders, and more.',
                order: 28,
              },
              {
                name: 'CSS Filters and Visual Effects',
                description:
                  'Applying filters such as blur, brightness, and contrast to images and elements for enhanced visuals.',
                order: 29,
              },
            ],
          },
          {
            name: 'JavaScript',
            description:
              'Master JavaScript to create interactive and dynamic web pages.',
            order: 3,
            topics: [
              {
                name: 'JavaScript Overview',
                description:
                  'What is JavaScript?, Client-Side JavaScript, Advantages of JavaScript, Limitations, Development Tools, Current State of JavaScript',
                order: 1,
              },
              {
                name: 'JavaScript Syntax',
                description:
                  'Your first JavaScript Code, Whitespace, Line Breaks, Semicolons, Case Sensitivity, Comments in JavaScript',
                order: 2,
              },
              {
                name: 'JavaScript Enabling',
                description:
                  'Enabling JavaScript in Internet Explorer, Firefox, Chrome, Opera, Warning for Non-JavaScript Browsers',
                order: 3,
              },
              {
                name: 'JavaScript Placement',
                description:
                  'JavaScript in <head>...</head> Section, <body>...</body> Section, Using External Files',
                order: 4,
              },
              {
                name: 'JavaScript Variables',
                description:
                  'Data Types, Variables, Scope, Naming Conventions, Reserved Words',
                order: 5,
              },
              {
                name: 'JavaScript Operators',
                description:
                  'Arithmetic, Assignment, Comparison, Logical, String, Unary, Ternary, Bitwise, Miscellaneous Operators',
                order: 6,
              },
              {
                name: 'JavaScript Control Structures',
                description:
                  'If-Else, Switch Statements, Loops (for, while, do...while)',
                order: 7,
              },
              {
                name: 'JavaScript Loop Control',
                description:
                  'Break and Continue Statements, Labels for Flow Control',
                order: 8,
              },
              {
                name: 'JavaScript Functions',
                description:
                  'Function Definition, Parameters, Return Statement, Function Literals, Nested Functions, Function Constructor',
                order: 9,
              },
              {
                name: 'JavaScript Events',
                description:
                  'What is an Event?, onClick, onSubmit, onMouseover, onMouseout, HTML5 Standard Events',
                order: 10,
              },
              {
                name: 'JavaScript Cookies',
                description:
                  'What are Cookies?, Storing, Reading, Setting Expiry Date, Deleting Cookies',
                order: 11,
              },
              {
                name: 'JavaScript Page Redirects',
                description:
                  'What is Page Redirection?, JS Page Refresh, Auto Refresh, How Page Redirection Works',
                order: 12,
              },
              {
                name: 'JavaScript Dialog Boxes',
                description:
                  'Alert, Confirm, Prompt Boxes, Window Methods for Alerts and Prompts',
                order: 13,
              },
              {
                name: 'JavaScript Void Keyword',
                description: 'The void Keyword and Its Use',
                order: 14,
              },
              {
                name: 'JavaScript Page Printing',
                description: 'How to Print a Page Using JavaScript',
                order: 15,
              },
              {
                name: 'JavaScript Objects',
                description:
                  "Object Properties, Methods, User-Defined Objects, Defining Methods for Objects, The 'with' Keyword",
                order: 16,
              },
              {
                name: 'JavaScript Numbers',
                description:
                  'Number Properties, Methods (toFixed, toExponential, etc.), Constructor, Prototype',
                order: 17,
              },
              {
                name: 'JavaScript Boolean',
                description:
                  'Boolean Properties, Methods (toString, valueOf), Constructor, Prototype',
                order: 18,
              },
              {
                name: 'JavaScript Strings',
                description:
                  'String Properties, Methods (charAt, indexOf, replace, slice, etc.), String HTML Wrappers (anchor, bold, italics)',
                order: 19,
              },
              {
                name: 'JavaScript Arrays',
                description:
                  'Array Properties, Methods (concat, filter, forEach, map, push, pop, etc.), Constructor, Prototype',
                order: 20,
              },
              {
                name: 'JavaScript Date',
                description:
                  'Date Properties, Methods (getDate, getDay, setDate, etc.), Static Methods (Date.parse, Date.UTC)',
                order: 21,
              },
              {
                name: 'JavaScript Math',
                description:
                  'Math Properties (PI, E), Methods (abs, ceil, floor, pow, random, round, etc.)',
                order: 22,
              },
              {
                name: 'JavaScript RegExp',
                description:
                  'Regular Expressions, Modifiers, Brackets, Metacharacters, Methods (exec, test)',
                order: 23,
              },
              {
                name: 'JavaScript DOM',
                description:
                  'The DOM (Document Object Model), W3C DOM, Legacy DOM, DOM Compatibility',
                order: 24,
              },
              {
                name: 'JavaScript Errors and Exceptions',
                description:
                  'Syntax Errors, Runtime Errors, try...catch...finally, throw Statement, onError Method',
                order: 25,
              },
              {
                name: 'JavaScript Form Validation',
                description: 'Basic Form Validation, Data Format Validation',
                order: 26,
              },
              {
                name: 'JavaScript Animation',
                description:
                  'Manual and Automated Animation, Mouse Event Rollover',
                order: 27,
              },
              {
                name: 'JavaScript Multimedia',
                description:
                  'Checking for Plug-Ins, Controlling Multimedia in JavaScript',
                order: 28,
              },
              {
                name: 'JavaScript Debugging',
                description:
                  'Error Messages in Browsers, Debugging Tools and Tips for Developers',
                order: 29,
              },
              {
                name: 'JavaScript Image Map',
                description: 'Using JavaScript for Image Maps',
                order: 30,
              },
              {
                name: 'JavaScript Browsers',
                description:
                  'Navigator Properties, Methods, Browser Detection Techniques',
                order: 31,
              },
            ],
          },
          {
            name: 'React.js',
            description:
              'Learn React to build component-based, single-page applications.',
            order: 4,
            topics: [
              {
                name: 'Introduction to React',
                description:
                  'Overview of React, its component-based architecture, and how it fits into modern web development.',
                order: 1,
              },
              {
                name: 'JSX',
                description:
                  'Understanding JSX syntax, how it integrates with JavaScript, and writing JSX to define the UI.',
                order: 2,
              },
              {
                name: 'Components',
                description:
                  'Introduction to React components, creating functional and class components, and component reusability.',
                order: 3,
              },
              {
                name: 'Props',
                description:
                  'Passing data to components using props, understanding props immutability, and using default props.',
                order: 4,
              },
              {
                name: 'State',
                description:
                  'Managing local component state using the useState hook, and understanding state changes and re-renders.',
                order: 5,
              },
              {
                name: 'Component Lifecycle',
                description:
                  'Understanding component lifecycle methods in class components and the useEffect hook for functional components.',
                order: 6,
              },
              {
                name: 'Event Handling in React',
                description:
                  'Handling events in React components, using synthetic events, and passing event handlers as props.',
                order: 7,
              },
              {
                name: 'Conditional Rendering',
                description:
                  'Rendering components conditionally based on state or props using JavaScript conditional operators.',
                order: 8,
              },
              {
                name: 'Lists and Keys',
                description:
                  'Rendering lists of data in React using the map function and understanding the importance of keys for performance.',
                order: 9,
              },
              {
                name: 'Forms in React',
                description:
                  'Handling form inputs, managing controlled components, form validation, and submitting form data.',
                order: 10,
              },
              {
                name: 'Lifting State Up',
                description:
                  'Sharing state between multiple components by lifting state to a common ancestor component.',
                order: 11,
              },
              {
                name: 'React Hooks',
                description:
                  'Introduction to React Hooks, including useState, useEffect, and custom hooks to manage logic in functional components.',
                order: 12,
              },
              {
                name: 'Context API',
                description:
                  "Managing global state using React's Context API and providing data across multiple components.",
                order: 13,
              },
              {
                name: 'React Router',
                description:
                  'Building single-page applications using React Router for navigation and routing between different views.',
                order: 14,
              },
              {
                name: 'React Portals',
                description:
                  'Rendering components outside the DOM hierarchy using React Portals for use cases like modals.',
                order: 15,
              },
              {
                name: 'Higher-Order Components (HOCs)',
                description:
                  'Understanding higher-order components (HOCs) and their use cases in code reuse and abstraction.',
                order: 16,
              },
              {
                name: 'Error Boundaries',
                description:
                  'Handling component errors using error boundaries and preventing UI crashes with error handling mechanisms.',
                order: 17,
              },
              {
                name: 'React Fragments',
                description:
                  'Using React Fragments to group elements without adding extra nodes to the DOM.',
                order: 18,
              },
              {
                name: 'React Memoization',
                description:
                  'Optimizing React performance using React.memo, useMemo, and useCallback hooks to prevent unnecessary re-renders.',
                order: 19,
              },
              {
                name: 'Server-Side Rendering (SSR)',
                description:
                  'Introduction to server-side rendering in React, understanding Next.js, and its benefits for SEO and performance.',
                order: 20,
              },
              {
                name: 'React Performance Optimization',
                description:
                  'Improving React app performance using techniques like lazy loading, code splitting, and avoiding prop drilling.',
                order: 21,
              },
              {
                name: 'React Testing',
                description:
                  'Introduction to testing React components using tools like Jest and React Testing Library for unit and integration tests.',
                order: 22,
              },
              {
                name: 'React and State Management Libraries',
                description:
                  'Using state management libraries like Redux, MobX, or Recoil for managing complex global state in larger applications.',
                order: 23,
              },
              {
                name: 'React Native',
                description:
                  'Introduction to React Native for building mobile applications using React principles and components.',
                order: 24,
              },
              {
                name: 'React with TypeScript',
                description:
                  'Combining React with TypeScript to add type safety, prop validation, and better development experience.',
                order: 25,
              },
              {
                name: 'React Dev Tools',
                description:
                  'Using React Developer Tools to inspect component trees, analyze performance, and debug applications.',
                order: 26,
              },
              {
                name: 'React Best Practices',
                description:
                  'Writing clean, maintainable, and scalable React code using best practices for component design, state management, and testing.',
                order: 27,
              },
            ],
          },
          {
            name: 'Vue.js',
            description:
              'An alternative frontend framework for building interactive user interfaces.',
            order: 5,
            topics: [
              {
                name: 'Introduction to Vue.js',
                description:
                  'Overview of Vue.js, its reactive data-binding, and its progressive framework approach.',
                order: 1,
              },
              {
                name: 'Vue Instance',
                description:
                  "Understanding the Vue instance, its lifecycle, and how it manages the app's data and methods.",
                order: 2,
              },
              {
                name: 'Vue Directives',
                description:
                  'Introduction to Vue directives like v-bind, v-if, v-for, v-show, and their usage for DOM manipulation.',
                order: 3,
              },
              {
                name: 'Data Binding',
                description:
                  'One-way and two-way data binding in Vue.js and how to update the DOM automatically based on changes in data.',
                order: 4,
              },
              {
                name: 'Event Handling in Vue.js',
                description:
                  'Handling user input with event listeners using the v-on directive and methods in Vue components.',
                order: 5,
              },
              {
                name: 'Vue Components',
                description:
                  'Creating and organizing reusable components in Vue.js and passing props to child components.',
                order: 6,
              },
              {
                name: 'Vue Computed Properties',
                description:
                  'Using computed properties to define reactive values based on other reactive data.',
                order: 7,
              },
              {
                name: 'Vue Watchers',
                description:
                  'Watching and responding to changes in data using Vue watchers for more dynamic control.',
                order: 8,
              },
              {
                name: 'Vue Methods',
                description:
                  'Defining and using methods in Vue components to handle business logic and interact with the DOM.',
                order: 9,
              },
              {
                name: 'Vue Lifecycle Hooks',
                description:
                  'Exploring lifecycle hooks (created, mounted, updated, destroyed) to run code at specific stages of a component’s life.',
                order: 10,
              },
              {
                name: 'Vue Router',
                description:
                  'Introduction to Vue Router for managing navigation and routing in single-page applications (SPA).',
                order: 11,
              },
              {
                name: 'Vuex for State Management',
                description:
                  'Centralized state management in Vue using Vuex to manage shared state across components.',
                order: 12,
              },
              {
                name: 'Form Handling in Vue.js',
                description:
                  'Handling form inputs, validations, and submissions with v-model for two-way data binding.',
                order: 13,
              },
              {
                name: 'Slots in Vue.js',
                description:
                  'Using slots to create flexible components that allow content projection and customization.',
                order: 14,
              },
              {
                name: 'Custom Directives',
                description:
                  'Creating and using custom Vue directives to encapsulate reusable DOM manipulations.',
                order: 15,
              },
              {
                name: 'Vue Filters',
                description:
                  'Using Vue filters to format data displayed in the template, like formatting dates or currencies.',
                order: 16,
              },
              {
                name: 'Vue Transitions and Animations',
                description:
                  "Creating smooth transitions and animations between components or views using Vue's built-in transition system.",
                order: 17,
              },
              {
                name: 'Vue with APIs (HTTP Requests)',
                description:
                  'Fetching and displaying data from external APIs using Axios or the Fetch API in Vue.js.',
                order: 18,
              },
              {
                name: 'Vue Composition API',
                description:
                  "Introduction to Vue's Composition API for organizing logic in a reusable and scalable way.",
                order: 19,
              },
              {
                name: 'Vue.js Best Practices',
                description:
                  'Writing maintainable, scalable Vue.js applications using best practices for component design and state management.',
                order: 20,
              },
              {
                name: 'Testing in Vue.js',
                description:
                  'Unit testing Vue components and applications using tools like Jest and Vue Test Utils.',
                order: 21,
              },
              {
                name: 'Vue 3 Features',
                description:
                  'Exploring new features introduced in Vue 3, such as the Composition API, teleport, and improved performance.',
                order: 22,
              },
              {
                name: 'Vue DevTools',
                description:
                  'Using Vue DevTools to debug and inspect Vue components, state, and events during development.',
                order: 23,
              },
              {
                name: 'Vue and TypeScript',
                description:
                  'Integrating Vue.js with TypeScript to add type safety and improve developer experience in Vue applications.',
                order: 24,
              },
              {
                name: 'Server-Side Rendering (SSR) with Vue',
                description:
                  'Understanding server-side rendering in Vue.js and using frameworks like Nuxt.js to build SSR applications.',
                order: 25,
              },
              {
                name: 'Vue Performance Optimization',
                description:
                  'Techniques for optimizing Vue applications for performance, including lazy loading, code splitting, and efficient rendering.',
                order: 26,
              },
            ],
          },
          {
            name: 'Frontend Frameworks',
            description:
              'Explore popular frontend frameworks like Bootstrap and Tailwind CSS.',
            order: 6,
            topics: [
              {
                name: 'Introduction to Frontend Frameworks',
                description:
                  'Overview of frontend frameworks and their role in building responsive, consistent UIs.',
                order: 1,
              },
              {
                name: 'Bootstrap Basics',
                description:
                  'Introduction to Bootstrap, its grid system, and responsive design features.',
                order: 2,
              },
              {
                name: 'Bootstrap Components',
                description:
                  'Using Bootstrap components like buttons, modals, cards, forms, and navbars.',
                order: 3,
              },
              {
                name: 'Bootstrap Utilities',
                description:
                  'Exploring Bootstrap utility classes for spacing, flexbox, display, and typography.',
                order: 4,
              },
              {
                name: 'Bootstrap Customization',
                description:
                  'Customizing Bootstrap with variables, theming, and Sass.',
                order: 5,
              },
              {
                name: 'Introduction to Tailwind CSS',
                description:
                  'Understanding Tailwind CSS, its utility-first approach, and how it differs from traditional frameworks.',
                order: 6,
              },
              {
                name: 'Tailwind CSS Utilities',
                description:
                  'Exploring Tailwind utility classes for layout, spacing, typography, colors, and responsive design.',
                order: 7,
              },
              {
                name: 'Customizing Tailwind CSS',
                description:
                  "Customizing Tailwind's design system with configuration files and extending utilities.",
                order: 8,
              },
              {
                name: 'Using Tailwind CSS with Frameworks',
                description:
                  'Integrating Tailwind CSS with frameworks like React, Vue, and Next.js.',
                order: 9,
              },
              {
                name: 'CSS Frameworks Comparison',
                description:
                  'Comparing Bootstrap, Tailwind CSS, Bulma, and other popular CSS frameworks.',
                order: 10,
              },
              {
                name: 'Responsive Design with Frameworks',
                description:
                  'Creating responsive layouts with grid systems and utilities in both Bootstrap and Tailwind CSS.',
                order: 11,
              },
              {
                name: 'Component Libraries Built on Bootstrap',
                description:
                  'Exploring component libraries like React-Bootstrap, Angular Bootstrap, and Bootstrap Vue.',
                order: 12,
              },
              {
                name: 'Tailwind CSS Plugins',
                description:
                  'Extending Tailwind CSS with plugins to add more utilities and functionality.',
                order: 13,
              },
              {
                name: 'Advanced Framework Techniques',
                description:
                  'Optimizing performance, customizing deeply, and advanced use cases in Bootstrap and Tailwind CSS.',
                order: 14,
              },
              {
                name: 'Frontend Frameworks Best Practices',
                description:
                  'Using best practices for maintaining clean, maintainable, and scalable styles with frontend frameworks.',
                order: 15,
              },
              {
                name: 'Framework Integration with Build Tools',
                description:
                  'Integrating frameworks like Bootstrap and Tailwind with build tools such as Webpack, Gulp, and PostCSS.',
                order: 16,
              },
              {
                name: 'Dark Mode in Frameworks',
                description:
                  'Implementing dark mode in Bootstrap and Tailwind CSS using built-in and custom utilities.',
                order: 17,
              },
              {
                name: 'Accessibility in Frontend Frameworks',
                description:
                  'Ensuring your UI is accessible using the built-in accessibility features of Bootstrap and Tailwind CSS.',
                order: 18,
              },
              {
                name: 'Grid and Flexbox Layout Systems',
                description:
                  'Understanding the grid and flexbox layout systems in Bootstrap and Tailwind CSS for modern layouts.',
                order: 19,
              },
              {
                name: 'Framework Migration and Versioning',
                description:
                  'Upgrading and migrating between major versions of frontend frameworks like Bootstrap and Tailwind CSS.',
                order: 20,
              },
            ],
          },
        ],
      },
      {
        name: 'Backend Development',
        description: 'Building the server-side of web applications.',
        order: 2,
        subjects: [
          {
            name: 'Node.js',
            description: 'JavaScript runtime for server-side development.',
            order: 1,
            topics: [
              {
                name: 'Node.js Basics',
                description:
                  'Introduction to Node.js, event-driven architecture, and its core modules like fs, path, and http.',
                order: 1,
              },
              {
                name: 'NPM (Node Package Manager)',
                description:
                  'Working with npm for managing packages, dependencies, and scripts.',
                order: 2,
              },
              {
                name: 'Modules and Require',
                description:
                  'Understanding CommonJS modules, require, and module.exports.',
                order: 3,
              },
              {
                name: 'Asynchronous Programming',
                description:
                  'Handling asynchronous code using callbacks, promises, and async/await in Node.js.',
                order: 4,
              },
              {
                name: 'File System (fs) Module',
                description:
                  'Working with the file system in Node.js for reading, writing, and manipulating files.',
                order: 5,
              },
              {
                name: 'HTTP Module',
                description:
                  'Creating HTTP servers, handling requests, and responses using the core http module.',
                order: 6,
              },
              {
                name: 'Event-Driven Programming',
                description:
                  "Understanding Node.js' event-driven architecture and working with the EventEmitter class.",
                order: 7,
              },
              {
                name: 'Express.js',
                description:
                  'Introduction to Express.js, a framework for building web applications and APIs with Node.js.',
                order: 8,
              },
              {
                name: 'Routing in Express.js',
                description:
                  'Setting up routes in Express.js for handling different endpoints and HTTP methods.',
                order: 9,
              },
              {
                name: 'Middleware in Express.js',
                description:
                  'Using middleware functions in Express.js for handling requests and responses.',
                order: 10,
              },
              {
                name: 'Templating Engines',
                description:
                  'Using templating engines like EJS and Pug to render dynamic HTML in Express.js applications.',
                order: 11,
              },
              {
                name: 'REST APIs',
                description:
                  'Building RESTful APIs with Express.js and handling JSON data.',
                order: 12,
              },
              {
                name: 'Database Integration',
                description:
                  'Connecting Node.js to databases like MongoDB, MySQL, or PostgreSQL using ORMs and native drivers.',
                order: 13,
              },
              {
                name: 'WebSockets',
                description:
                  'Implementing real-time communication using WebSockets with libraries like Socket.io.',
                order: 14,
              },
              {
                name: 'Authentication and Authorization',
                description:
                  'Implementing authentication with JWT and OAuth, and managing user roles and permissions.',
                order: 15,
              },
              {
                name: 'Error Handling in Node.js',
                description:
                  'Handling errors and exceptions gracefully in Node.js applications.',
                order: 16,
              },
              {
                name: 'Security in Node.js',
                description:
                  'Implementing security practices like HTTPS, data encryption, and handling vulnerabilities like SQL injection and XSS.',
                order: 17,
              },
              {
                name: 'Testing in Node.js',
                description:
                  'Writing unit, integration, and end-to-end tests using testing frameworks like Mocha, Jest, and Chai.',
                order: 18,
              },
              {
                name: 'Performance Optimization',
                description:
                  'Techniques for optimizing the performance and scalability of Node.js applications.',
                order: 19,
              },
              {
                name: 'Deploying Node.js Applications',
                description:
                  'Deploying Node.js applications to cloud platforms like Heroku, AWS, or Vercel.',
                order: 20,
              },
              {
                name: 'Cluster and Child Processes',
                description:
                  'Using the cluster module and child processes for handling multiple threads and improving performance.',
                order: 21,
              },
            ],
          },
          {
            name: 'Express.js',
            description:
              'Use Express to build RESTful APIs and handle server-side logic.',
            order: 2,
            topics: [
              {
                name: 'Introduction to Express.js',
                description:
                  'Overview of Express.js and its role in building web applications with Node.js.',
                order: 1,
              },
              {
                name: 'Routing in Express.js',
                description:
                  'Setting up routes for handling various HTTP methods (GET, POST, PUT, DELETE).',
                order: 2,
              },
              {
                name: 'Middleware',
                description:
                  'Using middleware functions for handling requests, responses, and errors.',
                order: 3,
              },
              {
                name: 'Templating Engines',
                description:
                  'Integrating templating engines like EJS and Pug for rendering dynamic HTML.',
                order: 4,
              },
              {
                name: 'RESTful API Design',
                description:
                  'Designing and building RESTful APIs using Express.js.',
                order: 5,
              },
              {
                name: 'Request Handling',
                description:
                  'Working with request parameters, query strings, and form data in Express.js.',
                order: 6,
              },
              {
                name: 'Error Handling',
                description:
                  'Implementing error-handling middleware for capturing and responding to errors.',
                order: 7,
              },
              {
                name: 'Static Files',
                description:
                  'Serving static files such as images, CSS, and JavaScript using Express.js.',
                order: 8,
              },
              {
                name: 'Database Integration',
                description:
                  'Connecting Express.js applications to databases like MongoDB and MySQL.',
                order: 9,
              },
              {
                name: 'Security in Express.js',
                description:
                  'Implementing security practices such as input validation, sanitization, and using Helmet for security headers.',
                order: 10,
              },
              {
                name: 'Authentication and Authorization',
                description:
                  'Using JWT, OAuth, and session-based authentication with Express.js.',
                order: 11,
              },
              {
                name: 'CORS Handling',
                description:
                  'Enabling Cross-Origin Resource Sharing (CORS) for handling requests from different origins.',
                order: 12,
              },
              {
                name: 'Express.js Performance Optimization',
                description:
                  'Improving the performance and scalability of Express.js applications.',
                order: 13,
              },
              {
                name: 'Testing Express.js Applications',
                description:
                  'Using tools like Mocha and Chai to write unit and integration tests for Express.js applications.',
                order: 14,
              },
            ],
          },
          {
            name: 'Authentication & Authorization',
            description:
              'Implement secure login systems using JWT, OAuth, and session management.',
            order: 3,
            topics: [
              {
                name: 'Introduction to Authentication and Authorization',
                description:
                  'Understanding the difference between authentication (identity verification) and authorization (permission control).',
                order: 1,
              },
              {
                name: 'Session-Based Authentication',
                description:
                  'Using sessions and cookies for maintaining user authentication across requests.',
                order: 2,
              },
              {
                name: 'Token-Based Authentication',
                description:
                  'Introduction to token-based authentication mechanisms like JWT (JSON Web Tokens).',
                order: 3,
              },
              {
                name: 'JWT Authentication',
                description:
                  'Implementing JWT for stateless authentication in APIs and web applications.',
                order: 4,
              },
              {
                name: 'OAuth 2.0',
                description:
                  'Using OAuth 2.0 for secure delegated access in applications, including login with third-party providers like Google and Facebook.',
                order: 5,
              },
              {
                name: 'Password Hashing',
                description:
                  'Securing passwords using hashing techniques like bcrypt or Argon2.',
                order: 6,
              },
              {
                name: 'Multi-Factor Authentication (MFA)',
                description:
                  'Adding an extra layer of security by implementing MFA with email, SMS, or authenticator apps.',
                order: 7,
              },
              {
                name: 'Role-Based Access Control (RBAC)',
                description:
                  'Managing access to resources based on user roles and permissions.',
                order: 8,
              },
              {
                name: 'Access Control Lists (ACL)',
                description:
                  'Using ACL to grant or deny access to specific resources or actions for individual users or groups.',
                order: 9,
              },
              {
                name: 'OAuth Scopes and Permissions',
                description:
                  'Defining scopes and permissions in OAuth to control user access to certain resources.',
                order: 10,
              },
              {
                name: 'Refresh Tokens',
                description:
                  'Understanding refresh tokens for maintaining long-lived user sessions without storing credentials.',
                order: 11,
              },
              {
                name: 'Social Authentication',
                description:
                  'Implementing social login using providers like Google, Facebook, and GitHub.',
                order: 12,
              },
              {
                name: 'Security Best Practices',
                description:
                  'Best practices for securing authentication flows, including preventing attacks like session hijacking and brute force.',
                order: 13,
              },
              {
                name: 'Authorization Middleware',
                description:
                  'Using middleware in Express.js or other frameworks to handle authorization based on user roles.',
                order: 14,
              },
              {
                name: 'Implementing Logout Functionality',
                description:
                  'Properly handling user logout by clearing sessions or tokens.',
                order: 15,
              },
            ],
          },
          {
            name: 'File Handling',
            description:
              'Learn how to handle file uploads and manage storage on the server.',
            order: 4,
            topics: [
              {
                name: 'Introduction to File Handling',
                description:
                  'Understanding the basics of working with files in a server-side environment.',
                order: 1,
              },
              {
                name: 'Handling File Uploads',
                description:
                  'Using libraries like Multer in Node.js to handle file uploads from clients.',
                order: 2,
              },
              {
                name: 'File Upload Validation',
                description:
                  'Validating uploaded files for size, type, and content to ensure security.',
                order: 3,
              },
              {
                name: 'Storing Files on the Server',
                description:
                  'Techniques for storing files locally on the server or using cloud services like AWS S3 or Cloudinary.',
                order: 4,
              },
              {
                name: 'File Storage Formats',
                description:
                  'Understanding different file storage formats such as Base64 encoding, binary storage, or file system storage.',
                order: 5,
              },
              {
                name: 'Serving Static Files',
                description:
                  'Using Express.js or other frameworks to serve static files like images, PDFs, and other assets.',
                order: 6,
              },
              {
                name: 'Handling Large Files',
                description:
                  'Techniques for handling large file uploads, including chunking and streaming.',
                order: 7,
              },
              {
                name: 'File Compression and Optimization',
                description:
                  'Compressing files to optimize storage and bandwidth usage.',
                order: 8,
              },
              {
                name: 'File Deletion',
                description:
                  'Managing file deletions safely and ensuring proper cleanup after files are no longer needed.',
                order: 9,
              },
              {
                name: 'Cloud File Storage',
                description:
                  'Using cloud storage services like Amazon S3, Google Cloud Storage, or Cloudinary for file storage and management.',
                order: 10,
              },
              {
                name: 'File Access Permissions',
                description:
                  'Implementing access controls and permissions for managing file accessibility and security.',
                order: 11,
              },
              {
                name: 'Security in File Handling',
                description:
                  'Protecting against vulnerabilities such as file upload attacks, malicious file types, and directory traversal.',
                order: 12,
              },
              {
                name: 'File Streaming',
                description:
                  'Handling real-time file streaming, such as for video or audio files, using Node.js streams.',
                order: 13,
              },
              {
                name: 'Handling File Downloads',
                description:
                  'Creating file download endpoints for users to retrieve files from the server.',
                order: 14,
              },
              {
                name: 'Metadata Management',
                description:
                  'Storing and managing metadata about files such as file type, size, and upload date.',
                order: 15,
              },
            ],
          },
          {
            name: 'Caching & Performance Optimization',
            description:
              'Improve backend performance with caching strategies like Redis.',
            order: 5,
            topics: [
              {
                name: 'Introduction to Caching',
                description:
                  "Understanding the basics of caching and why it's important for performance optimization.",
                order: 1,
              },
              {
                name: 'Caching Strategies',
                description:
                  'Exploring different caching strategies such as in-memory caching, disk caching, and distributed caching.',
                order: 2,
              },
              {
                name: 'Redis Basics',
                description:
                  'Introduction to Redis, an in-memory data structure store used for caching and database purposes.',
                order: 3,
              },
              {
                name: 'Setting Up Redis',
                description:
                  'Installation and configuration of Redis for use with your application.',
                order: 4,
              },
              {
                name: 'Implementing Caching with Redis',
                description:
                  'Using Redis to cache data and improve the performance of your backend applications.',
                order: 5,
              },
              {
                name: 'Cache Invalidation',
                description:
                  'Techniques for managing cache invalidation and ensuring that stale data does not persist in the cache.',
                order: 6,
              },
              {
                name: 'Cache Expiration and TTL',
                description:
                  'Configuring Time-To-Live (TTL) for cached data to automatically expire after a certain period.',
                order: 7,
              },
              {
                name: 'Caching Best Practices',
                description:
                  'Best practices for implementing caching, including when to cache, what to cache, and how to manage cache size.',
                order: 8,
              },
              {
                name: 'Performance Metrics and Monitoring',
                description:
                  'Measuring and monitoring the performance of your caching strategy to ensure effectiveness and make adjustments as needed.',
                order: 9,
              },
              {
                name: 'Database Query Optimization',
                description:
                  'Optimizing database queries and indexing to reduce load and improve response times.',
                order: 10,
              },
              {
                name: 'Load Balancing',
                description:
                  'Distributing traffic across multiple servers to improve performance and reliability.',
                order: 11,
              },
              {
                name: 'Application Profiling',
                description:
                  'Using profiling tools to identify performance bottlenecks in your application code.',
                order: 12,
              },
              {
                name: 'Asynchronous Processing',
                description:
                  'Implementing asynchronous processing and background jobs to handle long-running tasks and improve responsiveness.',
                order: 13,
              },
              {
                name: 'Content Delivery Networks (CDNs)',
                description:
                  'Using CDNs to cache and deliver static assets efficiently to users across different geographic locations.',
                order: 14,
              },
              {
                name: 'Performance Tuning for Node.js',
                description:
                  'Specific techniques for optimizing performance in Node.js applications, including event loop management and memory usage.',
                order: 15,
              },
            ],
          },
        ],
      },
      {
        name: 'Database Management',
        description: 'Understanding how to manage and interact with databases.',
        order: 3,
        subjects: [
          {
            name: 'SQL Databases',
            description:
              'Master relational databases like MySQL and PostgreSQL.',
            order: 1,
            topics: [
              {
                name: 'Introduction to SQL',
                description:
                  'Basics of SQL, including its syntax and the role of SQL in managing relational databases.',
                order: 1,
              },
              {
                name: 'Database Design',
                description:
                  'Principles of designing a relational database, including schema design and normalization.',
                order: 2,
              },
              {
                name: 'Data Types',
                description:
                  'Understanding different data types used in SQL databases and their appropriate use cases.',
                order: 3,
              },
              {
                name: 'CRUD Operations',
                description:
                  'Performing Create, Read, Update, and Delete operations on SQL databases.',
                order: 4,
              },
              {
                name: 'Joins and Relationships',
                description:
                  'Using joins to combine data from multiple tables and understanding the relationships between tables.',
                order: 5,
              },
              {
                name: 'Indexes',
                description:
                  'Creating and using indexes to improve query performance and speed up data retrieval.',
                order: 6,
              },
              {
                name: 'Transactions',
                description:
                  'Managing transactions in SQL to ensure data integrity and handle concurrent access.',
                order: 7,
              },
              {
                name: 'Stored Procedures',
                description:
                  'Creating and using stored procedures to encapsulate business logic and perform complex operations.',
                order: 8,
              },
              {
                name: 'Triggers',
                description:
                  'Implementing triggers to automatically execute actions in response to specific events in the database.',
                order: 9,
              },
              {
                name: 'Views',
                description:
                  'Creating and managing views to present data in a specific format or from multiple tables.',
                order: 10,
              },
              {
                name: 'Database Security',
                description:
                  'Implementing security measures to protect database data, including user roles and permissions.',
                order: 11,
              },
              {
                name: 'Database Backup and Recovery',
                description:
                  'Strategies for backing up and recovering data to prevent data loss and ensure business continuity.',
                order: 12,
              },
              {
                name: 'Performance Tuning',
                description:
                  'Optimizing database performance through query optimization, indexing strategies, and schema adjustments.',
                order: 13,
              },
              {
                name: 'Advanced SQL Queries',
                description:
                  'Using advanced SQL features and functions to perform complex queries and data manipulation.',
                order: 14,
              },
              {
                name: 'Data Migration',
                description:
                  'Techniques for migrating data between different databases or database versions.',
                order: 15,
              },
              {
                name: 'Database Design Patterns',
                description:
                  'Exploring common database design patterns and practices for scalable and maintainable database systems.',
                order: 16,
              },
              {
                name: 'Database Management Tools',
                description:
                  'Using tools and utilities for database management, such as MySQL Workbench, pgAdmin, and SQL Server Management Studio.',
                order: 17,
              },
              {
                name: 'SQL vs NoSQL',
                description:
                  'Understanding the differences between SQL (relational) and NoSQL (non-relational) databases and when to use each.',
                order: 18,
              },
            ],
          },
          {
            name: 'NoSQL Databases',
            description:
              'Learn about NoSQL databases like MongoDB for unstructured data.',
            order: 2,
            topics: [
              {
                name: 'Introduction to NoSQL',
                description:
                  'Basics of NoSQL databases, including their purpose and differences from relational databases.',
                order: 1,
              },
              {
                name: 'Types of NoSQL Databases',
                description:
                  'Overview of different types of NoSQL databases: Document, Key-Value, Column-Family, and Graph databases.',
                order: 2,
              },
              {
                name: 'Document Databases',
                description:
                  'Working with document-based databases like MongoDB, including CRUD operations and data modeling.',
                order: 3,
              },
              {
                name: 'Key-Value Stores',
                description:
                  'Introduction to key-value stores like Redis, including use cases and implementation.',
                order: 4,
              },
              {
                name: 'Column-Family Stores',
                description:
                  'Understanding column-family databases like Apache Cassandra and HBase, including schema design and queries.',
                order: 5,
              },
              {
                name: 'Graph Databases',
                description:
                  'Working with graph databases like Neo4j, including graph theory basics and querying with Cypher.',
                order: 6,
              },
              {
                name: 'Schema Design in NoSQL',
                description:
                  'Designing schemas in NoSQL databases, focusing on denormalization and data modeling for scalability.',
                order: 7,
              },
              {
                name: 'Data Modeling Best Practices',
                description:
                  'Best practices for data modeling in NoSQL databases, including choosing the right data model for your application.',
                order: 8,
              },
              {
                name: 'Querying NoSQL Databases',
                description:
                  'Techniques for querying data in NoSQL databases, including aggregation and filtering methods.',
                order: 9,
              },
              {
                name: 'Indexing in NoSQL Databases',
                description:
                  'Creating and managing indexes to optimize query performance in NoSQL databases.',
                order: 10,
              },
              {
                name: 'Replication and Sharding',
                description:
                  'Understanding replication and sharding strategies to ensure high availability and scalability.',
                order: 11,
              },
              {
                name: 'Consistency Models',
                description:
                  'Exploring different consistency models in NoSQL databases, such as eventual consistency and strong consistency.',
                order: 12,
              },
              {
                name: 'Security in NoSQL Databases',
                description:
                  'Implementing security measures in NoSQL databases, including access control and encryption.',
                order: 13,
              },
              {
                name: 'Backup and Recovery',
                description:
                  'Strategies for backing up and recovering data in NoSQL databases to prevent data loss.',
                order: 14,
              },
              {
                name: 'Performance Optimization',
                description:
                  'Techniques for optimizing performance in NoSQL databases, including query optimization and resource management.',
                order: 15,
              },
              {
                name: 'Integrating NoSQL with Applications',
                description:
                  'Integrating NoSQL databases with applications, including using drivers and libraries for different programming languages.',
                order: 16,
              },
              {
                name: 'NoSQL vs SQL',
                description:
                  'Understanding the differences between NoSQL and SQL databases, including use cases and advantages/disadvantages.',
                order: 17,
              },
            ],
          },
          {
            name: 'ORMs & Querying',
            description:
              'Use ORMs like Sequelize or Mongoose to interact with your database.',
            order: 3,
            topics: [
              {
                name: 'Introduction to ORMs',
                description:
                  'Overview of Object-Relational Mappers (ORMs) and their role in simplifying database interactions.',
                order: 1,
              },
              {
                name: 'Choosing an ORM',
                description:
                  'Comparing different ORMs available for Node.js, such as Sequelize, Mongoose, TypeORM, and their use cases.',
                order: 2,
              },
              {
                name: 'Sequelize Basics',
                description:
                  'Getting started with Sequelize: setting up, defining models, and basic CRUD operations.',
                order: 3,
              },
              {
                name: 'Sequelize Associations',
                description:
                  'Defining and managing associations between models in Sequelize, including one-to-one, one-to-many, and many-to-many relationships.',
                order: 4,
              },
              {
                name: 'Sequelize Querying',
                description:
                  'Performing queries with Sequelize: finding, filtering, and aggregating data.',
                order: 5,
              },
              {
                name: 'Sequelize Transactions',
                description:
                  'Using transactions in Sequelize to manage complex operations and ensure data integrity.',
                order: 6,
              },
              {
                name: 'Mongoose Basics',
                description:
                  'Introduction to Mongoose: setting up, defining schemas, and performing CRUD operations with MongoDB.',
                order: 7,
              },
              {
                name: 'Mongoose Schema Design',
                description:
                  'Designing schemas in Mongoose: defining schema types, validation, and default values.',
                order: 8,
              },
              {
                name: 'Mongoose Querying',
                description:
                  'Performing queries with Mongoose: finding, updating, and deleting documents.',
                order: 9,
              },
              {
                name: 'Mongoose Middleware',
                description:
                  'Using middleware functions in Mongoose for pre and post hooks to extend functionality.',
                order: 10,
              },
              {
                name: 'Query Optimization',
                description:
                  'Optimizing queries in ORMs: using indexes, optimizing queries for performance, and avoiding common pitfalls.',
                order: 11,
              },
              {
                name: 'Sequelize vs Mongoose',
                description:
                  'Comparing Sequelize and Mongoose: understanding their differences and choosing the right ORM for your needs.',
                order: 12,
              },
              {
                name: 'Advanced ORM Features',
                description:
                  'Exploring advanced features of ORMs: virtual fields, custom methods, and advanced querying techniques.',
                order: 13,
              },
              {
                name: 'ORM Integration with Express',
                description:
                  'Integrating ORMs with Express.js: setting up and using ORMs in Express applications for database operations.',
                order: 14,
              },
              {
                name: 'ORM Error Handling',
                description:
                  'Handling errors and exceptions when using ORMs: debugging and resolving common issues.',
                order: 15,
              },
            ],
          },
          {
            name: 'Database Relationships',
            description:
              'Learn how to structure databases using relationships like one-to-many and many-to-many.',
            order: 4,
            topics: [
              {
                name: 'Introduction to Database Relationships',
                description:
                  'Overview of database relationships, their importance, and how they impact data modeling.',
                order: 1,
              },
              {
                name: 'One-to-One Relationships',
                description:
                  'Understanding one-to-one relationships: where each record in one table is linked to exactly one record in another table.',
                order: 2,
              },
              {
                name: 'One-to-Many Relationships',
                description:
                  'Exploring one-to-many relationships: where a record in one table can be associated with multiple records in another table.',
                order: 3,
              },
              {
                name: 'Many-to-Many Relationships',
                description:
                  'Understanding many-to-many relationships: where multiple records in one table can be associated with multiple records in another table, and how to manage this using junction tables.',
                order: 4,
              },
              {
                name: 'Implementing Relationships in SQL',
                description:
                  'How to define and enforce relationships in SQL databases using foreign keys and constraints.',
                order: 5,
              },
              {
                name: 'Implementing Relationships in NoSQL Databases',
                description:
                  'Handling relationships in NoSQL databases like MongoDB, including embedding and referencing documents.',
                order: 6,
              },
              {
                name: 'Normalization and Denormalization',
                description:
                  'Understanding normalization to reduce data redundancy and denormalization to improve query performance.',
                order: 7,
              },
              {
                name: 'Database Schema Design',
                description:
                  'Designing database schemas with relationships in mind: creating efficient and scalable data models.',
                order: 8,
              },
              {
                name: 'Managing Relationships with ORMs',
                description:
                  'Using ORMs like Sequelize or Mongoose to define and manage relationships between models.',
                order: 9,
              },
              {
                name: 'Advanced Relationship Topics',
                description:
                  'Exploring advanced topics in database relationships, such as self-referencing tables and hierarchical data.',
                order: 10,
              },
              {
                name: 'Best Practices for Database Relationships',
                description:
                  'Best practices for designing and managing database relationships to ensure data integrity and performance.',
                order: 11,
              },
              {
                name: 'Common Pitfalls and Solutions',
                description:
                  'Identifying common issues in database relationships and solutions for resolving them.',
                order: 12,
              },
            ],
          },
          {
            name: 'Database Optimization',
            description:
              'Optimize database performance with indexing and query optimization techniques.',
            order: 5,
            topics: [
              {
                name: 'Introduction to Database Optimization',
                description:
                  'Overview of database optimization, its importance, and the impact on performance.',
                order: 1,
              },
              {
                name: 'Indexing Basics',
                description:
                  'Understanding indexing, types of indexes, and how they improve query performance.',
                order: 2,
              },
              {
                name: 'Creating and Managing Indexes',
                description:
                  'How to create, manage, and optimize indexes in SQL and NoSQL databases.',
                order: 3,
              },
              {
                name: 'Query Optimization',
                description:
                  'Techniques for optimizing SQL queries to improve execution time and efficiency.',
                order: 4,
              },
              {
                name: 'Execution Plans',
                description:
                  'Reading and interpreting database execution plans to identify performance bottlenecks.',
                order: 5,
              },
              {
                name: 'Database Normalization vs. Denormalization',
                description:
                  'Balancing normalization and denormalization for optimized performance and data integrity.',
                order: 6,
              },
              {
                name: 'Caching Strategies',
                description:
                  'Implementing caching mechanisms to reduce database load and improve performance.',
                order: 7,
              },
              {
                name: 'Database Partitioning',
                description:
                  'Techniques for partitioning large databases to enhance performance and manageability.',
                order: 8,
              },
              {
                name: 'Database Maintenance Tasks',
                description:
                  'Routine maintenance tasks such as vacuuming, reindexing, and analyzing to keep the database in optimal condition.',
                order: 9,
              },
              {
                name: 'Monitoring and Profiling',
                description:
                  'Tools and techniques for monitoring database performance and profiling queries to identify issues.',
                order: 10,
              },
              {
                name: 'Concurrency and Locking',
                description:
                  'Understanding concurrency control and locking mechanisms to prevent conflicts and maintain performance.',
                order: 11,
              },
              {
                name: 'Scaling Databases',
                description:
                  'Strategies for scaling databases, including vertical and horizontal scaling approaches.',
                order: 12,
              },
              {
                name: 'Best Practices for Database Optimization',
                description:
                  'Best practices and guidelines for maintaining optimal database performance.',
                order: 13,
              },
              {
                name: 'Troubleshooting Performance Issues',
                description:
                  'Identifying and resolving common performance issues in databases.',
                order: 14,
              },
            ],
          },
        ],
      },
      {
        name: 'Version Control',
        description:
          'Master Git and GitHub to manage and collaborate on projects.',
        order: 4,
        subjects: [
          {
            name: 'Git Basics',
            description: 'Learn the fundamentals of version control using Git.',
            order: 1,
            topics: [
              {
                name: 'Introduction to Git',
                description:
                  'Overview of Git, its purpose, and the benefits of using version control systems.',
                order: 1,
              },
              {
                name: 'Installing Git',
                description:
                  'Steps to install Git on different operating systems and configure it for the first use.',
                order: 2,
              },
              {
                name: 'Basic Git Commands',
                description:
                  'Introduction to essential Git commands such as `git init`, `git clone`, `git status`, `git add`, `git commit`, and `git push`.',
                order: 3,
              },
              {
                name: 'Understanding Git Workflow',
                description:
                  'Learn about the typical Git workflow including working directory, staging area, and repository.',
                order: 4,
              },
              {
                name: 'Branching and Merging',
                description:
                  'Basics of creating branches, switching between branches, and merging changes from different branches.',
                order: 5,
              },
              {
                name: 'Viewing Commit History',
                description:
                  'How to use commands like `git log` to view and analyze the commit history of a repository.',
                order: 6,
              },
              {
                name: 'Resolving Merge Conflicts',
                description:
                  'Techniques for resolving conflicts that occur during merges and rebases.',
                order: 7,
              },
              {
                name: 'Undoing Changes',
                description:
                  'Commands and techniques to undo changes, including `git revert`, `git reset`, and `git checkout`.',
                order: 8,
              },
              {
                name: 'Remote Repositories',
                description:
                  'How to work with remote repositories including setting up remotes, fetching, pulling, and pushing changes.',
                order: 9,
              },
              {
                name: 'Git Configuration',
                description:
                  'Setting up user information, configuring Git settings, and customizing your Git environment.',
                order: 10,
              },
              {
                name: 'Git Tags',
                description:
                  'Creating and managing tags to mark specific points in history.',
                order: 11,
              },
              {
                name: 'Collaboration and Pull Requests',
                description:
                  'Using Git for collaboration, including creating pull requests and code reviews.',
                order: 12,
              },
              {
                name: 'Best Practices for Git',
                description:
                  'Best practices for using Git effectively in development projects.',
                order: 13,
              },
            ],
          },
          {
            name: 'Branching & Merging',
            description:
              'Understand how to effectively use Git branches and merge strategies.',
            order: 2,
            topics: [
              {
                name: 'Introduction to Branching',
                description:
                  'Learn the concept of branches in Git and why they are used for managing different lines of development.',
                order: 1,
              },
              {
                name: 'Creating Branches',
                description:
                  'How to create new branches using `git branch` and `git checkout -b` commands.',
                order: 2,
              },
              {
                name: 'Switching Branches',
                description:
                  'Switch between branches using the `git checkout` and `git switch` commands.',
                order: 3,
              },
              {
                name: 'Merging Branches',
                description:
                  'Combine changes from different branches using `git merge` and understand merge strategies.',
                order: 4,
              },
              {
                name: 'Handling Merge Conflicts',
                description:
                  'Steps to resolve conflicts that occur during merges and how to use Git tools for conflict resolution.',
                order: 5,
              },
              {
                name: 'Rebasing vs. Merging',
                description:
                  'Difference between rebasing and merging, and when to use each approach.',
                order: 6,
              },
              {
                name: 'Interactive Rebase',
                description:
                  'Using interactive rebase to modify commit history and clean up commits before merging.',
                order: 7,
              },
              {
                name: 'Branching Strategies',
                description:
                  'Common branching strategies like Git Flow, GitHub Flow, and their use cases in team environments.',
                order: 8,
              },
              {
                name: 'Stashing Changes',
                description:
                  'How to use `git stash` to temporarily save changes while switching branches.',
                order: 9,
              },
              {
                name: 'Deleting Branches',
                description:
                  'How to delete local and remote branches using `git branch -d` and `git push origin --delete`.',
                order: 10,
              },
              {
                name: 'Remote Branches',
                description:
                  'Managing branches on remote repositories and understanding how to synchronize changes.',
                order: 11,
              },
              {
                name: 'Best Practices for Branching',
                description:
                  'Best practices for creating, managing, and merging branches to maintain a clean and organized repository.',
                order: 12,
              },
            ],
          },
          {
            name: 'Collaboration with GitHub',
            description:
              'Use GitHub to collaborate on code, handle pull requests, and manage repositories.',
            order: 3,
            topics: [
              {
                name: 'Introduction to GitHub',
                description:
                  'Overview of GitHub, its features, and how it integrates with Git for version control.',
                order: 1,
              },
              {
                name: 'Creating a GitHub Repository',
                description:
                  'How to create a new repository on GitHub and clone it to your local machine.',
                order: 2,
              },
              {
                name: 'Forking Repositories',
                description:
                  'How to fork a repository to create a personal copy for making changes or contributing to an open source project.',
                order: 3,
              },
              {
                name: 'Creating and Managing Issues',
                description:
                  'How to create issues for tracking bugs, feature requests, and other tasks within a repository.',
                order: 4,
              },
              {
                name: 'Pull Requests',
                description:
                  'How to create pull requests to propose changes to a repository, and the review process involved.',
                order: 5,
              },
              {
                name: 'Code Reviews',
                description:
                  'Best practices for reviewing code, providing feedback, and resolving comments on pull requests.',
                order: 6,
              },
              {
                name: 'Branch Protection Rules',
                description:
                  'How to set up branch protection rules to enforce code quality checks before merging changes.',
                order: 7,
              },
              {
                name: 'Managing Collaborators',
                description:
                  'How to add and manage collaborators in a repository, setting permissions and access levels.',
                order: 8,
              },
              {
                name: 'GitHub Actions',
                description:
                  'Introduction to GitHub Actions for automating workflows such as testing, building, and deploying code.',
                order: 9,
              },
              {
                name: 'GitHub Pages',
                description:
                  'How to use GitHub Pages to host static websites directly from a GitHub repository.',
                order: 10,
              },
              {
                name: 'Repository Management',
                description:
                  'Best practices for organizing and managing repositories, including using topics and tags.',
                order: 11,
              },
              {
                name: 'Security Features',
                description:
                  "Understanding and using GitHub's security features such as Dependabot alerts and security advisories.",
                order: 12,
              },
            ],
          },
        ],
      },
      {
        name: 'Testing & Debugging',
        description:
          'Ensure your application works as expected through testing and debugging.',
        order: 5,
        subjects: [
          {
            name: 'Unit Testing',
            description:
              'Write unit tests for your backend using Mocha or Jest.',
            order: 1,
            topics: [
              {
                name: 'Introduction to Unit Testing',
                description:
                  "Understand the basics of unit testing and why it's important for software development.",
                order: 1,
              },
              {
                name: 'Setting Up Mocha',
                description:
                  'Install and configure Mocha for writing and running unit tests.',
                order: 2,
              },
              {
                name: 'Writing Tests with Mocha',
                description:
                  "Learn how to write unit tests using Mocha's syntax and features.",
                order: 3,
              },
              {
                name: 'Assertions with Chai',
                description:
                  'Use Chai for making assertions in Mocha tests, including different types of assertions (e.g., should, expect, assert).',
                order: 4,
              },
              {
                name: 'Testing Asynchronous Code with Mocha',
                description:
                  'Techniques for testing asynchronous code and handling callbacks, promises, and async/await with Mocha.',
                order: 5,
              },
              {
                name: 'Introduction to Jest',
                description:
                  'Overview of Jest, including installation and setup for unit testing.',
                order: 6,
              },
              {
                name: 'Writing Tests with Jest',
                description:
                  "Learn how to write unit tests using Jest's syntax and features.",
                order: 7,
              },
              {
                name: 'Jest Matchers and Assertions',
                description:
                  "Explore Jest's built-in matchers and assertion methods for writing tests.",
                order: 8,
              },
              {
                name: 'Mocking and Spying in Jest',
                description:
                  "Use Jest's mocking and spying capabilities to test units in isolation and simulate dependencies.",
                order: 9,
              },
              {
                name: 'Testing Asynchronous Code with Jest',
                description:
                  'Techniques for testing asynchronous code with Jest, including handling promises and async/await.',
                order: 10,
              },
              {
                name: 'Test-Driven Development (TDD)',
                description:
                  'Understand the principles of TDD and how to apply them in your testing workflow.',
                order: 11,
              },
              {
                name: 'Code Coverage',
                description:
                  'Generate and analyze code coverage reports to ensure your tests cover all critical parts of your code.',
                order: 12,
              },
              {
                name: 'Best Practices for Unit Testing',
                description:
                  'Follow best practices for writing maintainable, reliable, and effective unit tests.',
                order: 13,
              },
              {
                name: 'Integration with CI/CD Pipelines',
                description:
                  'Integrate unit tests into your continuous integration and continuous deployment (CI/CD) pipelines for automated testing.',
                order: 14,
              },
            ],
          },
          {
            name: 'Frontend Testing',
            description:
              'Test your React components using tools like Jest and React Testing Library.',
            order: 2,
            topics: [
              {
                name: 'Introduction to Frontend Testing',
                description:
                  'Understand the importance of frontend testing and the tools commonly used in testing React applications.',
                order: 1,
              },
              {
                name: 'Setting Up Jest for Frontend Testing',
                description:
                  'Install and configure Jest for testing React components.',
                order: 2,
              },
              {
                name: 'Writing Tests with Jest',
                description:
                  "Learn how to write unit tests for React components using Jest's syntax and features.",
                order: 3,
              },
              {
                name: 'Introduction to React Testing Library',
                description:
                  'Overview of React Testing Library, including installation and setup for testing React components.',
                order: 4,
              },
              {
                name: 'Writing Tests with React Testing Library',
                description:
                  "Learn how to write tests for React components using React Testing Library's APIs.",
                order: 5,
              },
              {
                name: 'Testing Component Rendering',
                description:
                  'Test the rendering of React components, including checking for presence and content of elements.',
                order: 6,
              },
              {
                name: 'Testing User Interactions',
                description:
                  'Simulate and test user interactions like clicks, form submissions, and input changes using React Testing Library.',
                order: 7,
              },
              {
                name: 'Mocking Dependencies',
                description:
                  'Use Jest to mock dependencies and isolate components for testing.',
                order: 8,
              },
              {
                name: 'Testing Asynchronous Behavior',
                description:
                  'Test asynchronous behavior in React components, including handling async data fetching and state updates.',
                order: 9,
              },
              {
                name: 'Snapshot Testing',
                description:
                  "Use Jest's snapshot testing to ensure UI consistency and detect unexpected changes in components.",
                order: 10,
              },
              {
                name: 'Best Practices for Frontend Testing',
                description:
                  'Follow best practices for writing effective, maintainable, and reliable frontend tests.',
                order: 11,
              },
              {
                name: 'Integrating Tests with CI/CD Pipelines',
                description:
                  'Integrate frontend tests into continuous integration and continuous deployment (CI/CD) pipelines for automated testing.',
                order: 12,
              },
              {
                name: 'Testing with TypeScript',
                description:
                  'Learn how to test React components written in TypeScript, including handling types and interfaces in tests.',
                order: 13,
              },
              {
                name: 'Accessibility Testing',
                description:
                  'Test React components for accessibility issues using tools and techniques like aXe or Jest-A11y.',
                order: 14,
              },
            ],
          },
          {
            name: 'Integration Testing',
            description:
              'Test how different parts of your application interact with each other.',
            order: 3,
            topics: [
              {
                name: 'Introduction to Integration Testing',
                description:
                  'Understand the purpose and importance of integration testing in ensuring that various components of your application work together seamlessly.',
                order: 1,
              },
              {
                name: 'Setting Up Integration Testing Environment',
                description:
                  'Configure your testing environment to support integration testing, including necessary tools and libraries.',
                order: 2,
              },
              {
                name: 'Writing Integration Tests',
                description:
                  'Learn how to write integration tests that validate interactions between different components or services in your application.',
                order: 3,
              },
              {
                name: 'Testing API Integrations',
                description:
                  'Test the integration of your backend APIs with frontend components or other services to ensure they communicate correctly.',
                order: 4,
              },
              {
                name: 'Database Integration Testing',
                description:
                  'Perform integration tests involving database interactions to ensure data is correctly read from or written to the database.',
                order: 5,
              },
              {
                name: 'Mocking and Stubbing in Integration Tests',
                description:
                  'Use mocking and stubbing techniques to simulate external services or components that your application depends on during integration testing.',
                order: 6,
              },
              {
                name: 'End-to-End (E2E) Testing',
                description:
                  "Conduct end-to-end tests to verify that the entire application workflow works as expected from the user's perspective.",
                order: 7,
              },
              {
                name: 'Handling Asynchronous Operations',
                description:
                  'Test asynchronous operations and ensure that your application handles async events, such as API calls or delayed responses, correctly during integration tests.',
                order: 8,
              },
              {
                name: 'Integration Testing with CI/CD',
                description:
                  'Integrate integration tests into your continuous integration and continuous deployment (CI/CD) pipelines to automate testing and catch issues early.',
                order: 9,
              },
              {
                name: 'Best Practices for Integration Testing',
                description:
                  'Follow best practices for writing effective and maintainable integration tests, including test design, organization, and performance considerations.',
                order: 10,
              },
              {
                name: 'Debugging Integration Test Failures',
                description:
                  'Learn strategies for troubleshooting and debugging integration test failures to identify and resolve issues.',
                order: 11,
              },
              {
                name: 'Integration Testing Tools',
                description:
                  'Explore various tools and frameworks available for integration testing, such as Jest, Mocha, or Cypress.',
                order: 12,
              },
            ],
          },
          {
            name: 'Debugging Techniques',
            description:
              'Use browser DevTools and Node.js Debugger to troubleshoot issues.',
            order: 4,
            topics: [
              {
                name: 'Introduction to Debugging',
                description:
                  'Learn the importance of debugging and how to approach finding and fixing issues in your code.',
                order: 1,
              },
              {
                name: 'Browser DevTools Overview',
                description:
                  'Explore the features of browser DevTools, such as inspecting elements, monitoring network requests, and analyzing performance.',
                order: 2,
              },
              {
                name: 'Using Console for Debugging',
                description:
                  'Master console techniques like logging, warnings, and errors to trace issues in your code efficiently.',
                order: 3,
              },
              {
                name: 'Breakpoints and Step-by-Step Execution',
                description:
                  'Learn how to set breakpoints in browser DevTools and step through your code to identify issues line by line.',
                order: 4,
              },
              {
                name: 'DOM and CSS Debugging',
                description:
                  'Use browser DevTools to inspect and manipulate the DOM and troubleshoot CSS layout and style issues.',
                order: 5,
              },
              {
                name: 'Network Debugging',
                description:
                  'Track and debug network requests, such as API calls, by analyzing HTTP requests, responses, and WebSocket connections in DevTools.',
                order: 6,
              },
              {
                name: 'Performance Profiling',
                description:
                  'Use DevTools to analyze the performance of your application, including CPU usage, memory leaks, and rendering bottlenecks.',
                order: 7,
              },
              {
                name: 'Node.js Debugger',
                description:
                  'Use the built-in Node.js debugger to inspect server-side code, set breakpoints, and troubleshoot backend issues.',
                order: 8,
              },
              {
                name: 'Using VS Code Debugger',
                description:
                  'Configure and use Visual Studio Code’s debugger for both client-side (JavaScript) and server-side (Node.js) debugging.',
                order: 9,
              },
              {
                name: 'Error Handling Strategies',
                description:
                  'Learn effective strategies for handling errors in both frontend and backend code to prevent crashes and improve debugging efficiency.',
                order: 10,
              },
              {
                name: 'Debugging Asynchronous Code',
                description:
                  'Handle asynchronous issues in JavaScript by using async stack traces, and debugging promises, callbacks, and async/await.',
                order: 11,
              },
              {
                name: 'Common Debugging Pitfalls',
                description:
                  'Identify and avoid common mistakes developers make while debugging, such as ignoring browser warnings or overlooking async code.',
                order: 12,
              },
              {
                name: 'Advanced Debugging Tools',
                description:
                  'Explore additional debugging tools like Postman for API testing, and monitoring tools for catching errors in production.',
                order: 13,
              },
            ],
          },
        ],
      },
      {
        name: 'DevOps & Deployment',
        description:
          'Learn how to deploy your applications and maintain development pipelines.',
        order: 6,
        subjects: [
          {
            name: 'CI/CD',
            description:
              'Set up continuous integration and deployment pipelines using tools like Jenkins or GitLab CI.',
            order: 1,
            topics: [
              {
                name: 'Introduction to CI/CD',
                description:
                  'Learn the basics of continuous integration (CI) and continuous deployment (CD) and why they are essential in modern development.',
                order: 1,
              },
              {
                name: 'Setting Up Jenkins',
                description:
                  'Step-by-step guide to setting up Jenkins for automating build, test, and deployment processes.',
                order: 2,
              },
              {
                name: 'Using GitLab CI',
                description:
                  'Configure GitLab CI for setting up pipelines, running tests, and deploying code automatically.',
                order: 3,
              },
              {
                name: 'Automated Testing in CI',
                description:
                  'Learn how to integrate automated unit, integration, and end-to-end tests into your CI pipeline to ensure code quality.',
                order: 4,
              },
              {
                name: 'Building CI Pipelines',
                description:
                  'Understand how to build CI pipelines that run on code commits, including tasks like testing, linting, and packaging.',
                order: 5,
              },
              {
                name: 'Continuous Deployment Strategies',
                description:
                  'Explore various CD strategies like blue-green deployments, canary releases, and feature toggles for safe releases.',
                order: 6,
              },
              {
                name: 'Docker in CI/CD',
                description:
                  'Leverage Docker containers in your CI/CD pipeline for consistent and reproducible builds across environments.',
                order: 7,
              },
              {
                name: 'Version Control and CI',
                description:
                  'Learn how CI integrates with version control systems like GitHub and GitLab to automate testing and deployment upon new commits.',
                order: 8,
              },
              {
                name: 'Managing Secrets in CI/CD',
                description:
                  'Securely manage and inject sensitive data like API keys and credentials into CI/CD pipelines.',
                order: 9,
              },
              {
                name: 'CI/CD Pipeline for Node.js Applications',
                description:
                  'Build and deploy Node.js applications with automated testing and deployment using CI/CD pipelines.',
                order: 10,
              },
              {
                name: 'Monitoring and Logging',
                description:
                  'Set up monitoring and logging to track the performance and issues of deployed applications in production.',
                order: 11,
              },
              {
                name: 'Advanced CI/CD Concepts',
                description:
                  'Explore advanced topics like parallel builds, artifact management, and multi-environment deployments.',
                order: 12,
              },
            ],
          },
          {
            name: 'Docker & Containers',
            description:
              'Use Docker to containerize your applications for consistent environments.',
            order: 2,
            topics: [
              {
                name: 'Introduction to Docker',
                description:
                  'Learn the basics of Docker, containers, and how they help create consistent development and production environments.',
                order: 1,
              },
              {
                name: 'Installing Docker',
                description:
                  'Step-by-step guide to installing Docker on various platforms like Windows, macOS, and Linux.',
                order: 2,
              },
              {
                name: 'Dockerfile Basics',
                description:
                  'Understand how to create Dockerfiles to define your application’s environment and dependencies.',
                order: 3,
              },
              {
                name: 'Building Docker Images',
                description:
                  'Learn how to build Docker images from Dockerfiles and manage them with Docker CLI commands.',
                order: 4,
              },
              {
                name: 'Running Docker Containers',
                description:
                  'Run your applications in containers and understand container lifecycle management.',
                order: 5,
              },
              {
                name: 'Docker Volumes',
                description:
                  'Manage persistent data in Docker containers using volumes to ensure data is not lost between container restarts.',
                order: 6,
              },
              {
                name: 'Docker Networking',
                description:
                  'Learn how to manage container networking, including communication between multiple containers.',
                order: 7,
              },
              {
                name: 'Docker Compose',
                description:
                  'Use Docker Compose to define and run multi-container Docker applications with a single command.',
                order: 8,
              },
              {
                name: 'Container Orchestration',
                description:
                  'Introduction to container orchestration tools like Kubernetes and Docker Swarm for managing large-scale applications.',
                order: 9,
              },
              {
                name: 'Docker in CI/CD',
                description:
                  'Integrate Docker into CI/CD pipelines for consistent, containerized build and deployment environments.',
                order: 10,
              },
              {
                name: 'Docker Security',
                description:
                  'Implement security best practices for containerized applications, including image scanning and securing containers.',
                order: 11,
              },
              {
                name: 'Optimizing Docker Images',
                description:
                  'Techniques for minimizing Docker image size and improving container performance.',
                order: 12,
              },
              {
                name: 'Deploying Docker Containers',
                description:
                  'Learn how to deploy Docker containers to production using platforms like AWS, Heroku, or Kubernetes.',
                order: 13,
              },
              {
                name: 'Docker Registries',
                description:
                  'Manage and store Docker images in private or public registries like Docker Hub.',
                order: 14,
              },
            ],
          },
          {
            name: 'Cloud Platforms',
            description:
              'Learn about AWS, GCP, or Azure for cloud deployments.',
            order: 3,
            topics: [
              {
                name: 'Introduction to Cloud Computing',
                description:
                  'Understand the fundamentals of cloud computing, including IaaS, PaaS, and SaaS models.',
                order: 1,
              },
              {
                name: 'Overview of AWS',
                description:
                  'Learn about Amazon Web Services (AWS) and its core services like EC2, S3, and RDS.',
                order: 2,
              },
              {
                name: 'AWS EC2 and Scaling',
                description:
                  'Understand how to set up and manage EC2 instances, and how to use auto-scaling to handle traffic spikes.',
                order: 3,
              },
              {
                name: 'AWS S3 and Storage',
                description:
                  'Learn how to use Amazon S3 for object storage, including bucket management and data access controls.',
                order: 4,
              },
              {
                name: 'AWS RDS and Databases',
                description:
                  'Manage relational databases with Amazon RDS, including setup, backups, and performance tuning.',
                order: 5,
              },
              {
                name: 'Introduction to GCP',
                description:
                  'Explore Google Cloud Platform (GCP) and its key services like Compute Engine, Cloud Storage, and BigQuery.',
                order: 6,
              },
              {
                name: 'GCP Compute Engine',
                description:
                  'Learn how to use Google Compute Engine for virtual machine instances and scaling options.',
                order: 7,
              },
              {
                name: 'GCP Cloud Storage',
                description:
                  'Manage and use Google Cloud Storage for object storage, including bucket configuration and access control.',
                order: 8,
              },
              {
                name: 'GCP BigQuery',
                description:
                  'Introduction to BigQuery for data analytics, including querying and managing large datasets.',
                order: 9,
              },
              {
                name: 'Introduction to Azure',
                description:
                  'Get familiar with Microsoft Azure and its core services like Azure Virtual Machines, Blob Storage, and Azure SQL Database.',
                order: 10,
              },
              {
                name: 'Azure Virtual Machines',
                description:
                  'Learn to set up and manage Azure Virtual Machines, including scaling and cost management.',
                order: 11,
              },
              {
                name: 'Azure Blob Storage',
                description:
                  'Manage Azure Blob Storage for storing and accessing unstructured data.',
                order: 12,
              },
              {
                name: 'Azure SQL Database',
                description:
                  'Understand how to use Azure SQL Database for managing relational data, including setup and scaling options.',
                order: 13,
              },
              {
                name: 'Cloud Deployment Strategies',
                description:
                  'Learn best practices for deploying applications to the cloud, including CI/CD pipelines and infrastructure as code.',
                order: 14,
              },
              {
                name: 'Cloud Security',
                description:
                  'Understand cloud security best practices, including identity and access management, encryption, and compliance.',
                order: 15,
              },
              {
                name: 'Cost Management in the Cloud',
                description:
                  'Learn to manage and optimize cloud costs using tools and best practices for budgeting and monitoring.',
                order: 16,
              },
              {
                name: 'Multi-Cloud and Hybrid Cloud Solutions',
                description:
                  'Explore strategies for managing multi-cloud and hybrid cloud environments to leverage the strengths of multiple cloud providers.',
                order: 17,
              },
            ],
          },
          {
            name: 'Serverless Architecture',
            description:
              'Explore serverless computing with AWS Lambda or Azure Functions.',
            order: 4,
            topics: [
              {
                name: 'Introduction to Serverless Computing',
                description:
                  'Understand the concept of serverless computing, its benefits, and how it differs from traditional server-based architectures.',
                order: 1,
              },
              {
                name: 'AWS Lambda Basics',
                description:
                  'Learn the fundamentals of AWS Lambda, including creating and deploying Lambda functions, and understanding triggers and event sources.',
                order: 2,
              },
              {
                name: 'AWS Lambda Use Cases',
                description:
                  'Explore common use cases for AWS Lambda, such as data processing, real-time file processing, and microservices.',
                order: 3,
              },
              {
                name: 'Azure Functions Basics',
                description:
                  'Get started with Azure Functions, including creating and managing functions, and understanding the different hosting plans.',
                order: 4,
              },
              {
                name: 'Azure Functions Use Cases',
                description:
                  'Learn about typical use cases for Azure Functions, such as handling HTTP requests, integrating with other Azure services, and processing events.',
                order: 5,
              },
              {
                name: 'Serverless Architecture Design',
                description:
                  'Design serverless architectures, including best practices for scalability, fault tolerance, and event-driven workflows.',
                order: 6,
              },
              {
                name: 'API Gateway Integration',
                description:
                  'Learn how to use API Gateway with AWS Lambda or Azure Functions to create and manage RESTful APIs.',
                order: 7,
              },
              {
                name: 'Monitoring and Debugging Serverless Applications',
                description:
                  'Understand how to monitor, log, and debug serverless applications using tools provided by AWS and Azure.',
                order: 8,
              },
              {
                name: 'Security in Serverless Architecture',
                description:
                  'Explore security practices for serverless applications, including authentication, authorization, and data protection.',
                order: 9,
              },
              {
                name: 'Cost Management for Serverless',
                description:
                  'Learn how to manage and optimize costs in serverless environments, including understanding pricing models and usage patterns.',
                order: 10,
              },
              {
                name: 'Serverless Frameworks and Tools',
                description:
                  'Explore frameworks and tools that help in developing, deploying, and managing serverless applications, such as the Serverless Framework, SAM, and Azure CLI.',
                order: 11,
              },
              {
                name: 'Serverless Best Practices',
                description:
                  'Learn best practices for serverless application development, including efficient code design, error handling, and performance optimization.',
                order: 12,
              },
            ],
          },

          {
            name: 'PaaS Platforms',
            description:
              'Deploy applications quickly with platforms like Heroku or Vercel.',
            order: 5,
            topics: [
              {
                name: 'Introduction to PaaS',
                description:
                  'Understand the concept of Platform as a Service (PaaS), its benefits, and how it simplifies application deployment and management.',
                order: 1,
              },
              {
                name: 'Heroku Basics',
                description:
                  'Learn the fundamentals of deploying applications on Heroku, including setting up a Heroku account, deploying apps, and using Heroku CLI.',
                order: 2,
              },
              {
                name: 'Heroku Add-ons',
                description:
                  'Explore Heroku add-ons and integrations, including databases, caching, and monitoring services that can be easily added to your Heroku applications.',
                order: 3,
              },
              {
                name: 'Scaling and Performance on Heroku',
                description:
                  'Understand how to scale applications on Heroku, manage resources, and optimize performance for different workloads.',
                order: 4,
              },
              {
                name: 'Vercel Basics',
                description:
                  'Get started with Vercel, including deploying static sites and serverless functions, and understanding Vercel’s features for front-end applications.',
                order: 5,
              },
              {
                name: 'Vercel Configuration',
                description:
                  'Learn how to configure your Vercel deployments, including environment variables, build settings, and custom domains.',
                order: 6,
              },
              {
                name: 'Integrations with Vercel',
                description:
                  'Explore integrations with Vercel for enhancing deployment workflows, such as connecting with GitHub for automatic deployments and using Vercel’s analytics.',
                order: 7,
              },
              {
                name: 'Scaling and Optimization on Vercel',
                description:
                  'Understand how to scale your applications on Vercel and optimize performance for global deployments.',
                order: 8,
              },
              {
                name: 'Comparing PaaS Platforms',
                description:
                  'Compare Heroku and Vercel with other PaaS platforms to understand their strengths, use cases, and differences.',
                order: 9,
              },
              {
                name: 'Cost Management in PaaS',
                description:
                  'Learn how to manage and optimize costs associated with PaaS platforms, including understanding pricing models and usage patterns.',
                order: 10,
              },
              {
                name: 'Security Best Practices on PaaS',
                description:
                  'Explore security best practices for applications deployed on PaaS platforms, including data protection, access controls, and compliance considerations.',
                order: 11,
              },
              {
                name: 'PaaS Troubleshooting and Support',
                description:
                  'Learn how to troubleshoot common issues on PaaS platforms and access support resources for resolving deployment and operational problems.',
                order: 12,
              },
            ],
          },
        ],
      },
      {
        name: 'Security',
        description: 'Understand how to build secure applications.',
        order: 7,
        subjects: [
          {
            name: 'Web Security Fundamentals',
            description: 'Learn about HTTPS, SSL, and secure HTTP headers.',
            order: 1,
            topics: [
              {
                name: 'Introduction to Web Security',
                description:
                  'Understand the importance of web security, common threats, and the principles of securing web applications.',
                order: 1,
              },
              {
                name: 'HTTPS and SSL/TLS',
                description:
                  'Learn how HTTPS works, the role of SSL/TLS in securing data transmission, and how to implement SSL/TLS certificates.',
                order: 2,
              },
              {
                name: 'Secure HTTP Headers',
                description:
                  'Explore essential HTTP headers that enhance security, including Content Security Policy (CSP), Strict-Transport-Security (HSTS), and X-Frame-Options.',
                order: 3,
              },
              {
                name: 'Encryption Basics',
                description:
                  'Understand encryption techniques used to protect data, including symmetric and asymmetric encryption, and how they are applied in web security.',
                order: 4,
              },
              {
                name: 'Authentication and Authorization',
                description:
                  'Learn about secure authentication methods, such as multi-factor authentication (MFA), and best practices for managing user authorization.',
                order: 5,
              },
              {
                name: 'Cross-Site Scripting (XSS)',
                description:
                  'Understand XSS vulnerabilities, how they can be exploited, and techniques to prevent XSS attacks, including input validation and output encoding.',
                order: 6,
              },
              {
                name: 'Cross-Site Request Forgery (CSRF)',
                description:
                  'Learn about CSRF attacks, how they work, and how to protect against them using techniques like CSRF tokens and same-site cookies.',
                order: 7,
              },
              {
                name: 'SQL Injection',
                description:
                  'Explore SQL injection vulnerabilities, their impact, and how to prevent them through parameterized queries and input validation.',
                order: 8,
              },
              {
                name: 'Security Best Practices',
                description:
                  'Implement best practices for web security, including secure coding practices, regular security audits, and staying updated with security patches.',
                order: 9,
              },
              {
                name: 'Security Tools and Resources',
                description:
                  'Discover tools and resources for web security testing and monitoring, such as vulnerability scanners and security plugins.',
                order: 10,
              },
              {
                name: 'Incident Response and Management',
                description:
                  'Learn how to respond to and manage security incidents, including identifying breaches, containment strategies, and recovery processes.',
                order: 11,
              },
              {
                name: 'Legal and Compliance Considerations',
                description:
                  'Understand legal and regulatory requirements related to web security, such as GDPR, CCPA, and other data protection laws.',
                order: 12,
              },
            ],
          },
          {
            name: 'Authentication & Authorization',
            description:
              'Implement secure user authentication and authorization using JWT or OAuth.',
            order: 2,
            topics: [
              {
                name: 'Introduction to Authentication & Authorization',
                description:
                  'Understand the basic concepts of authentication and authorization, including their roles in securing applications.',
                order: 1,
              },
              {
                name: 'Authentication Basics',
                description:
                  'Learn about authentication methods, including username/password, multi-factor authentication (MFA), and password hashing.',
                order: 2,
              },
              {
                name: 'JSON Web Tokens (JWT)',
                description:
                  'Explore how to use JWT for stateless authentication, including token creation, verification, and handling token expiration.',
                order: 3,
              },
              {
                name: 'OAuth 2.0',
                description:
                  'Understand the OAuth 2.0 framework, including authorization flows like Authorization Code, Implicit, Client Credentials, and Resource Owner Password.',
                order: 4,
              },
              {
                name: 'Implementing OAuth',
                description:
                  'Learn how to implement OAuth 2.0 in your applications, including integrating with third-party OAuth providers.',
                order: 5,
              },
              {
                name: 'Authorization Strategies',
                description:
                  'Explore different authorization strategies, including role-based access control (RBAC), attribute-based access control (ABAC), and permission management.',
                order: 6,
              },
              {
                name: 'Securing API Endpoints',
                description:
                  'Learn how to protect API endpoints using authentication and authorization mechanisms, including middleware for validating tokens and user roles.',
                order: 7,
              },
              {
                name: 'Handling User Sessions',
                description:
                  'Understand how to manage user sessions securely, including using cookies, session storage, and token-based authentication.',
                order: 8,
              },
              {
                name: 'Revoking Tokens and Session Management',
                description:
                  'Learn strategies for revoking tokens and managing user sessions, including token blacklisting and handling logout processes.',
                order: 9,
              },
              {
                name: 'Security Best Practices',
                description:
                  'Implement best practices for authentication and authorization, including secure storage of credentials, minimizing attack surfaces, and regular security audits.',
                order: 10,
              },
              {
                name: 'Common Vulnerabilities and Mitigation',
                description:
                  'Understand common vulnerabilities related to authentication and authorization, such as credential stuffing and session fixation, and how to mitigate them.',
                order: 11,
              },
              {
                name: 'User Management and Roles',
                description:
                  'Learn how to manage users and their roles, including creating, updating, and deleting user accounts and handling role assignments.',
                order: 12,
              },
            ],
          },
          {
            name: 'Common Attacks & Prevention',
            description:
              'Learn how to protect your applications from XSS, CSRF, and SQL injection.',
            order: 3,
            topics: [
              {
                name: 'Introduction to Common Attacks',
                description:
                  'Overview of common web application attacks and their impact on security.',
                order: 1,
              },
              {
                name: 'Cross-Site Scripting (XSS)',
                description:
                  'Understand XSS attacks, including types such as stored, reflected, and DOM-based XSS, and how to prevent them.',
                order: 2,
              },
              {
                name: 'Preventing XSS',
                description:
                  'Techniques for preventing XSS attacks, including input validation, output encoding, and using security libraries.',
                order: 3,
              },
              {
                name: 'Cross-Site Request Forgery (CSRF)',
                description:
                  'Learn about CSRF attacks, how they work, and their potential consequences.',
                order: 4,
              },
              {
                name: 'Preventing CSRF',
                description:
                  'Strategies to prevent CSRF attacks, including the use of CSRF tokens, SameSite cookies, and secure HTTP methods.',
                order: 5,
              },
              {
                name: 'SQL Injection',
                description:
                  'Understand SQL injection attacks, including how they exploit vulnerabilities in SQL queries and their potential impacts.',
                order: 6,
              },
              {
                name: 'Preventing SQL Injection',
                description:
                  'Techniques for preventing SQL injection, such as using parameterized queries, prepared statements, and ORM frameworks.',
                order: 7,
              },
              {
                name: 'Security Headers',
                description:
                  'Utilizing HTTP security headers (e.g., Content Security Policy, X-Content-Type-Options) to mitigate various attacks.',
                order: 8,
              },
              {
                name: 'Input Validation & Sanitization',
                description:
                  'Best practices for validating and sanitizing user input to prevent injection and XSS attacks.',
                order: 9,
              },
              {
                name: 'Session Management',
                description:
                  'Securing sessions to prevent session fixation and hijacking attacks, including using secure cookies and session expiration strategies.',
                order: 10,
              },
              {
                name: 'Logging and Monitoring',
                description:
                  'Implementing logging and monitoring to detect and respond to attacks effectively.',
                order: 11,
              },
              {
                name: 'Regular Security Audits',
                description:
                  'Conducting regular security audits and vulnerability assessments to identify and address potential security issues.',
                order: 12,
              },
            ],
          },
          {
            name: 'Encryption',
            description:
              'Master encryption techniques like hashing and salting passwords.',
            order: 4,
            topics: [
              {
                name: 'Introduction to Encryption',
                description:
                  'Understand the basics of encryption, including its importance in securing data.',
                order: 1,
              },
              {
                name: 'Types of Encryption',
                description:
                  'Overview of symmetric and asymmetric encryption methods and their use cases.',
                order: 2,
              },
              {
                name: 'Hashing',
                description:
                  'Learn about hashing algorithms (e.g., SHA-256, MD5) and their role in data integrity and security.',
                order: 3,
              },
              {
                name: 'Salting Passwords',
                description:
                  'Techniques for adding salt to passwords before hashing to enhance security against rainbow table attacks.',
                order: 4,
              },
              {
                name: 'Key Management',
                description:
                  'Best practices for managing and securing encryption keys.',
                order: 5,
              },
              {
                name: 'Encryption Standards and Protocols',
                description:
                  'Overview of common encryption standards and protocols (e.g., AES, RSA, TLS/SSL).',
                order: 6,
              },
              {
                name: 'Implementing Encryption',
                description:
                  'Practical guide to implementing encryption in applications, including libraries and tools.',
                order: 7,
              },
              {
                name: 'Data Encryption at Rest',
                description:
                  'Techniques for encrypting stored data to protect it from unauthorized access.',
                order: 8,
              },
              {
                name: 'Data Encryption in Transit',
                description:
                  'Methods for encrypting data during transmission to secure it from interception.',
                order: 9,
              },
              {
                name: 'Public Key Infrastructure (PKI)',
                description:
                  'Understanding PKI and how it supports encryption and digital certificates.',
                order: 10,
              },
              {
                name: 'Encrypting Sensitive Information',
                description:
                  'Best practices for encrypting sensitive data such as personal information and financial records.',
                order: 11,
              },
              {
                name: 'Compliance and Regulations',
                description:
                  'Understanding encryption-related compliance requirements and regulations (e.g., GDPR, HIPAA).',
                order: 12,
              },
            ],
          },

          {
            name: 'Security Testing',
            description:
              'Use tools like OWASP ZAP or Burp Suite to identify security vulnerabilities.',
            order: 5,
            topics: [
              {
                name: 'Introduction to Security Testing',
                description:
                  'Understanding the importance of security testing in identifying and mitigating vulnerabilities.',
                order: 1,
              },
              {
                name: 'Security Testing Methodologies',
                description:
                  'Overview of common security testing methodologies, including black-box, white-box, and gray-box testing.',
                order: 2,
              },
              {
                name: 'OWASP ZAP',
                description:
                  'Using OWASP ZAP (Zed Attack Proxy) for automated and manual security testing of web applications.',
                order: 3,
              },
              {
                name: 'Burp Suite',
                description:
                  'Introduction to Burp Suite and its features for web security testing, including scanning and analyzing vulnerabilities.',
                order: 4,
              },
              {
                name: 'Vulnerability Scanning',
                description:
                  'Techniques and tools for scanning applications and networks for known vulnerabilities.',
                order: 5,
              },
              {
                name: 'Manual Security Testing',
                description:
                  'Performing manual security assessments to find vulnerabilities that automated tools might miss.',
                order: 6,
              },
              {
                name: 'Common Vulnerabilities',
                description:
                  'Understanding common security vulnerabilities such as XSS, SQL injection, CSRF, and how to test for them.',
                order: 7,
              },
              {
                name: 'Penetration Testing',
                description:
                  'Conducting penetration tests to simulate attacks and identify weaknesses in applications and systems.',
                order: 8,
              },
              {
                name: 'Reporting and Remediation',
                description:
                  'Best practices for documenting security findings and recommending remediation strategies.',
                order: 9,
              },
              {
                name: 'Security Testing Automation',
                description:
                  'Automating security testing processes and integrating them into CI/CD pipelines.',
                order: 10,
              },
              {
                name: 'Compliance and Standards',
                description:
                  'Understanding compliance requirements and security standards related to testing (e.g., PCI-DSS, HIPAA).',
                order: 11,
              },
              {
                name: 'Security Testing Tools Integration',
                description:
                  'Integrating security testing tools with development and deployment workflows for continuous security assessments.',
                order: 12,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Data Science',
    description: 'A detailed roadmap to excel in Data Science.',
    tags: 'DataScience,Python,MachineLearning,DataAnalysis',
    mainConcepts: [
      {
        name: 'Data Analysis',
        description: 'Techniques for analyzing and interpreting data.',
        order: 1,
        subjects: [
          {
            name: 'Python',
            description: 'Programming language for data analysis.',
            order: 1,
            topics: [
              {
                name: 'Python Basics',
                description: 'Introduction to Python syntax and data types.',
                order: 1,
              },
              {
                name: 'Data Manipulation',
                description:
                  'Using libraries like Pandas for data manipulation.',
                order: 2,
              },
            ],
          },
          {
            name: 'Statistics',
            description: 'Fundamental statistical methods and techniques.',
            order: 2,
            topics: [
              {
                name: 'Descriptive Statistics',
                description: 'Techniques for summarizing and describing data.',
                order: 1,
              },
              {
                name: 'Inferential Statistics',
                description:
                  'Making inferences about a population from sample data.',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        name: 'Machine Learning',
        description: 'Building and deploying machine learning models.',
        order: 2,
        subjects: [
          {
            name: 'Supervised Learning',
            description: 'Machine learning with labeled data.',
            order: 1,
            topics: [
              {
                name: 'Regression Analysis',
                description: 'Predicting continuous outcomes.',
                order: 1,
              },
              {
                name: 'Classification',
                description: 'Categorizing data into predefined classes.',
                order: 2,
              },
            ],
          },
          {
            name: 'Unsupervised Learning',
            description: 'Machine learning with unlabeled data.',
            order: 2,
            topics: [
              {
                name: 'Clustering',
                description: 'Grouping similar data points together.',
                order: 1,
              },
              {
                name: 'Dimensionality Reduction',
                description: 'Reducing the number of features in the data.',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
];
