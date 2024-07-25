// // models/Article.js
// import { DataTypes } from "sequelize";
// import sequelize from "../config/database.js";
// import Resource from "./resource.js"; // Ensure correct import path

// const Article = sequelize.define(
//   "Article",
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     author: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     isSelected: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },
//     topicId: {
//       type: DataTypes.UUID,
//       references: {
//         model: "Resources", // Ensure the model name matches the Resource model
//         key: "id",
//       },
//       allowNull: false,
//       onDelete: "CASCADE", // Optional: Handle delete cascades if needed
//     },
//   },
//   {
//     timestamps: true, // Include createdAt and updatedAt fields
//   }
// );

// Resource.hasMany(Article, { foreignKey: "topicId" });
// Article.belongsTo(Resource, { foreignKey: "topicId" });

// export default Article;
