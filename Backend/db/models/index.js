"use strict";

import Sequelize from "sequelize";
import config from "../../config/config.js";
import Article from "./article.model.js";
import Battle from "./battle.model.js";
import Chat from "./chat.model.js";
import Course from "./course.model.js";
import Forum from "./forum.model.js";
import InterviewQuestion from "./interviewQuestion.model.js";
import Job from "./job.model.js";
import Resource from "./resource.model.js";
import RoadMap from "./roadmap.model.js";
import RoadMapSubject from "./roadmapSubjects.model.js";
import Subject from "./subject.model.js";
import Topic from "./topic.model.js";
import User from "./user.model.js";
import UserInfo from "./userInfo.model.js";
import UserPoints from "./userPoints.model.js";
import UserRoadmap from "./userRoadmap.model.js";
import MainConcept from "./mainConcepts.model.js";
import UserProgress from "./userProgress.model.js";
import Quiz from "./quiz.model.js"; // Add Quiz model
import QuizQuestion from "./quizQuestion.model.js"; // Add QuizQuestion model
import QuizAnswer from "./quizAnswer.model.js"; // Add QuizAnswer model
import QuizSubmission from "./quizSubmission.model.js"; // Add QuizSubmission model
import QuizSubmissionAnswer from "./quizSubmissionAnswer.model.js"; // Add QuizSubmissionAnswer model

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {
  Article: Article(sequelize, Sequelize.DataTypes),
  Battle: Battle(sequelize, Sequelize.DataTypes),
  Chat: Chat(sequelize, Sequelize.DataTypes),
  Course: Course(sequelize, Sequelize.DataTypes),
  Forum: Forum(sequelize, Sequelize.DataTypes),
  InterviewQuestion: InterviewQuestion(sequelize, Sequelize.DataTypes),
  Job: Job(sequelize, Sequelize.DataTypes),
  Resource: Resource(sequelize, Sequelize.DataTypes),
  RoadMap: RoadMap(sequelize, Sequelize.DataTypes),
  RoadMapSubject: RoadMapSubject(sequelize, Sequelize.DataTypes),
  Subject: Subject(sequelize, Sequelize.DataTypes),
  Topic: Topic(sequelize, Sequelize.DataTypes),
  User: User(sequelize, Sequelize.DataTypes),
  UserInfo: UserInfo(sequelize, Sequelize.DataTypes),
  UserPoints: UserPoints(sequelize, Sequelize.DataTypes),
  UserRoadmap: UserRoadmap(sequelize, Sequelize.DataTypes),
  MainConcept: MainConcept(sequelize, Sequelize.DataTypes),
  UserProgress: UserProgress(sequelize, Sequelize.DataTypes),
  Quiz: Quiz(sequelize, Sequelize.DataTypes),
  QuizQuestion: QuizQuestion(sequelize, Sequelize.DataTypes),
  QuizAnswer: QuizAnswer(sequelize, Sequelize.DataTypes),
  QuizSubmission: QuizSubmission(sequelize, Sequelize.DataTypes),
  QuizSubmissionAnswer: QuizSubmissionAnswer(sequelize, Sequelize.DataTypes),
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
