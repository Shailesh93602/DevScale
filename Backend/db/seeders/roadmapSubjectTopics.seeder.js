import db from "../models/index.js";

const roadmaps = [
  {
    title: "Full Stack Web Development",
    description:
      "A comprehensive roadmap to become a Full Stack Web Developer.",
    mainConcepts: [
      {
        name: "Frontend Development",
        description: "Building the client-side of web applications.",
        subjects: [
          {
            name: "HTML",
            description: "Markup language for creating web pages.",
            topics: [
              {
                name: "HTML Basics",
                description: "Introduction to HTML tags and elements.",
              },
              {
                name: "Text Formatting",
                description:
                  "Formatting text using HTML elements like bold, italics, and more.",
              },
              {
                name: "Links and Navigation",
                description: "Creating links and navigation bars.",
              },
              {
                name: "Images and Multimedia",
                description: "Adding images, videos, and audio to web pages.",
              },
              {
                name: "Forms and Input",
                description: "Creating forms and handling user input.",
              },
              {
                name: "Tables",
                description: "Creating and styling HTML tables.",
              },
              {
                name: "Lists",
                description:
                  "Creating ordered, unordered, and definition lists.",
              },
              {
                name: "Semantic HTML",
                description:
                  "Using semantic HTML elements to structure content.",
              },
              {
                name: "HTML Forms Advanced",
                description:
                  "Advanced form features like file uploads and form submission handling.",
              },
              {
                name: "HTML5 Features",
                description:
                  "New features in HTML5, including multimedia and APIs.",
              },
              {
                name: "Responsive Design with HTML",
                description: "Using HTML and CSS for responsive web design.",
              },
              {
                name: "HTML Accessibility",
                description:
                  "Making web pages accessible with ARIA and other techniques.",
              },
              {
                name: "HTML Best Practices",
                description:
                  "Best practices for writing clean and efficient HTML.",
              },
              {
                name: "HTML Scripting",
                description: "Embedding and linking JavaScript in HTML.",
              },
              {
                name: "HTML Metadata and SEO",
                description:
                  "Using metadata for search engine optimization and social sharing.",
              },
              {
                name: "HTML & CSS Integration",
                description:
                  "Integrating HTML with CSS for styling and layouts.",
              },
              {
                name: "HTML Advanced Topics",
                description:
                  "Advanced HTML features like custom data attributes and HTML templates.",
              },
              {
                name: "HTML for Web Applications",
                description:
                  "Using HTML in modern web applications with frameworks.",
              },
              {
                name: "HTML for Email",
                description:
                  "Creating responsive HTML emails with inline styles.",
              },
              {
                name: "HTML for Forms with Validation",
                description: "Using HTML5 form attributes for validation.",
              },
              {
                name: "HTML for SEO and Performance",
                description:
                  "Optimizing HTML for search engines and performance.",
              },
              {
                name: "Microdata and HTML",
                description: "Adding microdata for structured content and SEO.",
              },
            ],
          },
          {
            name: "CSS",
            description: "Styling language for web pages.",
            topics: [
              {
                name: "CSS Basics",
                description: "Introduction to CSS syntax and selectors.",
              },
              {
                name: "Flexbox and Grid",
                description: "Layouts with Flexbox and CSS Grid.",
              },
            ],
          },
          {
            name: "JavaScript",
            description: "Programming language for web development.",
            topics: [
              {
                name: "JavaScript Basics",
                description: "Introduction to JavaScript syntax and variables.",
              },
              {
                name: "DOM Manipulation",
                description: "Interacting with the HTML DOM using JavaScript.",
              },
            ],
          },
        ],
      },
      {
        name: "Backend Development",
        description: "Building the server-side of web applications.",
        subjects: [
          {
            name: "Node.js",
            description: "JavaScript runtime for server-side development.",
            topics: [
              {
                name: "Node.js Basics",
                description: "Introduction to Node.js and its core modules.",
              },
              {
                name: "Express.js",
                description:
                  "Framework for building web applications with Node.js.",
              },
            ],
          },
          {
            name: "Databases",
            description: "Managing and storing data.",
            topics: [
              {
                name: "SQL Basics",
                description:
                  "Introduction to SQL queries and database management.",
              },
              {
                name: "NoSQL Databases",
                description: "Overview of NoSQL databases like MongoDB.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Data Science",
    description: "A detailed roadmap to excel in Data Science.",
    mainConcepts: [
      {
        name: "Data Analysis",
        description: "Techniques for analyzing and interpreting data.",
        subjects: [
          {
            name: "Python",
            description: "Programming language for data analysis.",
            topics: [
              {
                name: "Python Basics",
                description: "Introduction to Python syntax and data types.",
              },
              {
                name: "Data Manipulation",
                description:
                  "Using libraries like Pandas for data manipulation.",
              },
            ],
          },
          {
            name: "Statistics",
            description: "Fundamental statistical methods and techniques.",
            topics: [
              {
                name: "Descriptive Statistics",
                description: "Techniques for summarizing and describing data.",
              },
              {
                name: "Inferential Statistics",
                description:
                  "Making inferences about a population from sample data.",
              },
            ],
          },
        ],
      },
      {
        name: "Machine Learning",
        description: "Building and deploying machine learning models.",
        subjects: [
          {
            name: "Supervised Learning",
            description: "Machine learning with labeled data.",
            topics: [
              {
                name: "Regression Analysis",
                description: "Predicting continuous outcomes.",
              },
              {
                name: "Classification",
                description: "Categorizing data into predefined classes.",
              },
            ],
          },
          {
            name: "Unsupervised Learning",
            description: "Machine learning with unlabeled data.",
            topics: [
              {
                name: "Clustering",
                description: "Grouping similar data points together.",
              },
              {
                name: "Dimensionality Reduction",
                description: "Reducing the number of features in the data.",
              },
            ],
          },
        ],
      },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const roadmapData of roadmaps) {
      const [roadmap] = await db.RoadMap.findOrCreate({
        where: { title: roadmapData.title },
        defaults: {
          description: roadmapData.description,
        },
      });

      for (const mainConceptData of roadmapData.mainConcepts) {
        const [mainConcept] = await db.MainConcept.findOrCreate({
          where: { name: mainConceptData.name },
          defaults: {
            description: mainConceptData.description,
            roadmapId: roadmap.id,
          },
        });

        for (const subjectData of mainConceptData.subjects) {
          const [subject, created] = await db.Subject.findOrCreate({
            where: { name: subjectData.name },
            defaults: {
              description: subjectData.description,
              mainConceptId: mainConcept.id,
            },
          });

          // If the subject was found (i.e., not created), update the mainConceptId
          if (!created && subject.mainConceptId !== mainConcept.id) {
            await subject.update({ mainConceptId: mainConcept.id });
          }

          for (const topicData of subjectData.topics) {
            await db.Topic.findOrCreate({
              where: { title: topicData.name },
              defaults: {
                description: topicData.description,
                subjectId: subject.id,
              },
            });
          }
        }
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedDatabase();
