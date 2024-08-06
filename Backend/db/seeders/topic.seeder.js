import db from "../models/index.js";

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
    name: "Binary Trees",
    description:
      "A tree data structure in which each node has at most two children.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Binary Search Trees",
    description:
      "A binary tree with the property that all nodes in the left subtree are less than the root node and all nodes in the right subtree are greater.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "AVL Trees",
    description: "Self-balancing binary search tree.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Heaps",
    description: "Complete binary tree used to implement priority queues.",
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
  {
    name: "Dynamic Programming",
    description:
      "Optimization technique for solving problems by breaking them down into simpler subproblems.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Greedy Algorithms",
    description: "Algorithms that make the optimal choice at each step.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Backtracking",
    description:
      "Algorithmic technique for solving problems recursively by trying to build a solution incrementally.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Divide and Conquer",
    description: "Algorithm design paradigm based on multi-branched recursion.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Graph Traversal",
    description:
      "Techniques for visiting all the nodes in a graph (e.g., BFS, DFS).",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Minimum Spanning Tree",
    description:
      "A subset of the edges in a weighted graph that connects all the vertices without cycles and with the minimum possible total edge weight.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Shortest Path Algorithms",
    description:
      "Algorithms for finding the shortest paths between nodes in a graph.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Disjoint Set",
    description:
      "Data structure that keeps track of a partition of a set into disjoint subsets.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Bit Manipulation",
    description:
      "Techniques to perform operations on individual bits of a number.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "String Algorithms",
    description:
      "Algorithms for performing operations on strings, such as searching and matching.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Trie",
    description:
      "Tree-like data structure used for storing a dynamic set or associative array where the keys are usually strings.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Suffix Trees",
    description: "Data structure that represents the suffixes of a string.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Segment Trees",
    description:
      "Data structure for storing information about intervals or segments.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Fenwick Trees",
    description:
      "Data structure that can efficiently update elements and calculate prefix sums in a table of numbers.",
    subject: "Data Structures and Algorithms",
  },
  {
    name: "Introduction to Object-Oriented Programming",
    description:
      "Fundamentals and principles of Object-Oriented Programming (OOP).",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Classes and Objects",
    description:
      "Blueprints of objects, representing real-world entities and their properties.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Encapsulation",
    description:
      "The concept of bundling data and methods that operate on that data within one unit.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Inheritance",
    description:
      "Mechanism by which one class can inherit properties and methods from another class.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Polymorphism",
    description:
      "The ability to process objects differently based on their data type or class.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Abstraction",
    description:
      "The concept of hiding the complex implementation details and showing only the essential features.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Interfaces",
    description:
      "Abstract types used to specify a behavior that classes must implement.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Abstract Classes",
    description:
      "Classes that cannot be instantiated and are designed to be subclassed.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Constructor and Destructor",
    description:
      "Special methods for initializing and cleaning up instances of a class.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Method Overloading",
    description:
      "Defining multiple methods in the same class with the same name but different parameters.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Method Overriding",
    description:
      "Providing a new implementation for a method inherited from a superclass.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Access Modifiers",
    description:
      "Keywords that set the accessibility of classes, methods, and other members.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Static and Instance Members",
    description:
      "Difference between static (class-level) and instance (object-level) members.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Composition",
    description:
      "A design principle where a class references one or more objects of other classes in its instance variables.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Aggregation",
    description:
      "A special form of association that represents a 'whole-part' relationship between a whole and its parts.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Association",
    description:
      "A relationship between two classes that establishes a connection between their objects.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Delegation",
    description:
      "A design pattern where an object passes on its responsibilities to another helper object.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Design Patterns",
    description:
      "Reusable solutions to common problems in software design, including patterns like Singleton, Factory, Observer, etc.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Exception Handling",
    description:
      "Mechanisms to handle runtime errors and exceptions in an orderly fashion.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "UML (Unified Modeling Language)",
    description:
      "A standardized modeling language for visualizing the design of a system.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "SOLID Principles",
    description:
      "A set of five design principles intended to make software designs more understandable, flexible, and maintainable.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Object Life Cycle",
    description:
      "The stages through which an object passes during its lifetime: creation, use, and destruction.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Object-Oriented Analysis and Design",
    description:
      "The process of analyzing and designing a system by visualizing it as a group of interacting objects.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Memory Management in OOP",
    description:
      "Techniques for efficient allocation and deallocation of memory in OOP languages.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Refactoring",
    description:
      "The process of restructuring existing code without changing its external behavior.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Mixins",
    description:
      "A class that provides methods to other classes without being a parent class.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Multiple Inheritance",
    description:
      "A feature of some OOP languages where a class can inherit from more than one superclass.",
    subject: "Object-Oriented Programming",
  },
  {
    name: "Introduction to Databases",
    description: "Overview of database concepts and the need for databases.",
    subject: "Database Systems",
  },
  {
    name: "Database Management Systems (DBMS)",
    description: "Software that uses databases to store and manage data.",
    subject: "Database Systems",
  },
  {
    name: "Relational Databases",
    description:
      "Databases structured to recognize relations among stored items of information.",
    subject: "Database Systems",
  },
  {
    name: "SQL (Structured Query Language)",
    description:
      "Standard language for managing and manipulating relational databases.",
    subject: "Database Systems",
  },
  {
    name: "NoSQL Databases",
    description:
      "Non-relational databases that provide flexible schemas for unstructured data.",
    subject: "Database Systems",
  },
  {
    name: "Data Modeling",
    description:
      "The process of creating a data model for an information system by defining data structures and relationships.",
    subject: "Database Systems",
  },
  {
    name: "Entity-Relationship Model (ER Model)",
    description: "A diagrammatic technique for modeling data relationships.",
    subject: "Database Systems",
  },
  {
    name: "Normalization",
    description:
      "The process of organizing data to minimize redundancy and improve data integrity.",
    subject: "Database Systems",
  },
  {
    name: "SQL Joins",
    description:
      "Techniques for combining rows from two or more tables based on a related column.",
    subject: "Database Systems",
  },
  {
    name: "Indexes",
    description:
      "Database structures that improve the speed of data retrieval.",
    subject: "Database Systems",
  },
  {
    name: "Transactions",
    description:
      "A sequence of operations performed as a single logical unit of work.",
    subject: "Database Systems",
  },
  {
    name: "ACID Properties",
    description:
      "Set of properties that guarantee database transactions are processed reliably (Atomicity, Consistency, Isolation, Durability).",
    subject: "Database Systems",
  },
  {
    name: "Database Security",
    description:
      "Measures used to protect the database from unauthorized access or malicious attacks.",
    subject: "Database Systems",
  },
  {
    name: "Backup and Recovery",
    description:
      "Processes for creating copies of data and restoring data in the event of loss.",
    subject: "Database Systems",
  },
  {
    name: "Data Warehousing",
    description:
      "Systems used for reporting and data analysis, centralizing large amounts of data.",
    subject: "Database Systems",
  },
  {
    name: "Data Mining",
    description:
      "The process of discovering patterns and knowledge from large amounts of data.",
    subject: "Database Systems",
  },
  {
    name: "Database Design",
    description:
      "The process of designing the structure of a database to store and manage data effectively.",
    subject: "Database Systems",
  },
  {
    name: "Database Schema",
    description:
      "The structure that defines the organization of data within a database.",
    subject: "Database Systems",
  },
  {
    name: "Distributed Databases",
    description: "Databases distributed across different physical locations.",
    subject: "Database Systems",
  },
  {
    name: "Data Integrity",
    description: "The accuracy and consistency of data within a database.",
    subject: "Database Systems",
  },
  {
    name: "Data Concurrency",
    description:
      "The ability of the database to allow multiple users to access the data at the same time.",
    subject: "Database Systems",
  },
  {
    name: "Data Replication",
    description: "The process of copying data from one location to another.",
    subject: "Database Systems",
  },
  {
    name: "Big Data",
    description:
      "Large and complex data sets that require advanced tools to process and analyze.",
    subject: "Database Systems",
  },
  {
    name: "Cloud Databases",
    description: "Databases that run on cloud computing platforms.",
    subject: "Database Systems",
  },
  {
    name: "Graph Databases",
    description: "Databases that use graph structures for semantic queries.",
    subject: "Database Systems",
  },
  {
    name: "In-Memory Databases",
    description: "Databases that store data in memory to improve performance.",
    subject: "Database Systems",
  },
  {
    name: "Object-Oriented Databases",
    description:
      "Databases that integrate object-oriented programming with database technology.",
    subject: "Database Systems",
  },
  {
    name: "Database Normal Forms",
    description:
      "Guidelines to reduce redundancy and dependency in a relational database.",
    subject: "Database Systems",
  },
  {
    name: "Query Optimization",
    description: "Techniques to improve the efficiency of query processing.",
    subject: "Database Systems",
  },
  {
    name: "Database Migration",
    description: "The process of moving data from one database to another.",
    subject: "Database Systems",
  },
  {
    name: "Data Governance",
    description:
      "The management of data availability, usability, integrity, and security.",
    subject: "Database Systems",
  },
  {
    name: "Data Visualization",
    description:
      "The representation of data in graphical format to help understand patterns and insights.",
    subject: "Database Systems",
  },
  {
    name: "Database Performance Tuning",
    description: "Techniques to optimize and improve database performance.",
    subject: "Database Systems",
  },
];

const seedTopics = async () => {
  try {
    await db.connect;

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
