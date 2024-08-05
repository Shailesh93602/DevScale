import db from "../models/index.js";

const subjects = [
  {
    name: "Data Structures and Algorithms",
    description: "Fundamental concepts of data structures and algorithms.",
  },
  {
    name: "Object-Oriented Programming",
    description: "Principles and concepts of object-oriented programming.",
  },
  {
    name: "Database Systems",
    description: "Introduction to database design and SQL.",
  },
  {
    name: "Operating Systems",
    description: "Core concepts of operating systems.",
  },
  { name: "Computer Networks", description: "Basics of computer networking." },
  {
    name: "Software Engineering",
    description: "Software development methodologies and practices.",
  },
  {
    name: "Discrete Mathematics",
    description: "Mathematical foundations for computer science.",
  },
  {
    name: "Artificial Intelligence",
    description: "Introduction to AI concepts and techniques.",
  },
  {
    name: "Machine Learning",
    description: "Fundamentals of machine learning.",
  },
  {
    name: "Cyber Security",
    description: "Introduction to cybersecurity principles.",
  },
];

const seedSubjects = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const subject of subjects) {
      await db.Subject.findOrCreate({
        where: { name: subject.name },
        defaults: subject,
      });
    }

    console.log("Subjects seeded successfully");
  } catch (error) {
    console.error("Error seeding subjects:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedSubjects();
