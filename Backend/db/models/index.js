import User from "./user.model.js";
import UserInfo from "./userInfo.model.js";
import Subject from "./subject.model.js";
import Topic from "./topic.model.js";
import RoadMap from "./roadmap.model.js";

// Initialize models
const models = {
  User,
  UserInfo,
  Subject,
  Topic,
  RoadMap,
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export default models;
