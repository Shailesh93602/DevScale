import Article from "./articleModel.js";
import Resource from "./resource.js";
import Subject from "./subjectModel.js";
import Topic from "./topicModel.js";

// Function to initialize models and set up associations
export const initializeModels = () => {
  Resource.hasMany(Article, { foreignKey: "resourceId" });
  Subject.hasMany(Topic, { foreignKey: "subjectId" });
  Topic.belongsTo(Subject, { foreignKey: "subjectId" });
};

export { Subject, Topic, Article };
