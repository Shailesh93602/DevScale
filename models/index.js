import Article from "./articleModel.js";
import Resource from "./resource.js";
import Subject from "./subjectModel.js";
import Topic from "./topicModel.js";

export const initializeModels = () => {
  Resource.hasMany(Article, { foreignKey: "resourceId" });
  Subject.hasMany(Topic, { foreignKey: "subjectId" });
  Topic.belongsTo(Subject, { foreignKey: "subjectId" });
};

export { Subject, Topic, Article };
