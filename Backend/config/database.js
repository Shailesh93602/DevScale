// import { Sequelize } from "sequelize";
// import { config } from "dotenv";
// import Subject from "../models/subjectModel.js";
// import Topic from "../models/topicModel.js";

// config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//     logging: false,
//   }
// );

// const initDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");

//     // Synchronize all models
//     await sequelize.sync({ force: true });
//     console.log("All models were synchronized successfully.");

//     // Insert initial data
//     const subjects = [
//       { name: "DSA", description: "Data Structures and Algorithms" },
//       { name: "OOPS", description: "Object-Oriented Programming Systems" },
//     ];

//     for (const subjectData of subjects) {
//       const subject = await Subject.create(subjectData);
//       console.log(`Inserted subject: ${subject.name}`);
//     }

//     const topics = [
//       { name: "Arrays", description: "Introduction to arrays", subjectId: 1 },
//       { name: "Stacks", description: "Introduction to stacks", subjectId: 1 },
//       {
//         name: "Classes and Objects",
//         description: "Basics of classes and objects",
//         subjectId: 2,
//       },
//       {
//         name: "Inheritance",
//         description: "Understanding inheritance in OOP",
//         subjectId: 2,
//       },
//     ];

//     for (const topicData of topics) {
//       const topic = await Topic.create(topicData);
//       console.log(`Inserted topic: ${topic.name}`);
//     }
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };

// initDB();

// export default sequelize;
