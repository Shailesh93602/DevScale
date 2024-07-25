// // models/Resource.js
// import { DataTypes } from "sequelize";
// import sequelize from "../config/database.js";
// import Article from "./articleModel.js";
// import InterviewQuestion from "./interviewQuestionsModel.js";

// const Resource = sequelize.define(
//   "Resource",
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     subject: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     topic: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     subtopic: {
//       type: DataTypes.STRING,
//       allowNull: true, // Subtopics may not always be applicable
//     },
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//       onUpdate: DataTypes.NOW, // Automatically updates on record modification
//     },
//   },
//   {
//     timestamps: true, // Use Sequelize's automatic timestamps
//   }
// );

// // Define relationships if needed
// Resource.hasMany(Article, { foreignKey: "topicId" });
// Article.belongsTo(Resource, { foreignKey: "topicId" });

// Resource.hasMany(InterviewQuestion, { foreignKey: "resourceId" });
// InterviewQuestion.belongsTo(Resource, { foreignKey: "resourceId" });

// export default Resource;
