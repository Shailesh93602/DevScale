import { loadModels } from "../models/index.js";

const topics = [
  {
    name: "Arrays",
    description: "Collection of elements identified by index or key.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Linked Lists",
    description:
      "Linear collection of data elements pointing to the next node.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Stacks",
    description: "LIFO (last in, first out) data structure.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Queues",
    description: "FIFO (first in, first out) data structure.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Trees",
    description: "Hierarchical data structure with a root value and subtrees.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Graphs",
    description: "Non-linear data structure of nodes connected by edges.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Hash Tables",
    description: "Data structure that implements an associative array.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Recursion",
    description:
      "Method where the solution depends on solutions to smaller instances.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Sorting Algorithms",
    description: "Algorithms for arranging data in a particular order.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Searching Algorithms",
    description: "Algorithms for finding an item from a collection of items.",
    subject: "Data Structures and Algorithms",
  },
  // Add more topics for other subjects as needed
];

const seedTopics = async () => {
  let db;
  try {
    db = await loadModels();

    await db.sequelize.authenticate();

    for (const topic of topics) {
      const subject = await db.Subject.findOne({
        where: { name: topic.subject },
      });
      if (subject) {
        await db.Topic.findOrCreate({
          where: { name: topic.name },
          defaults: {
            ...topic,
            subjectId: subject.id,
          },
        });
      } else {
        console.error(`Subject "${topic.subject}" not found`);
      }
    }

    console.log("Topics seeded successfully");
  } catch (error) {
    console.error("Error seeding topics:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedTopics();
