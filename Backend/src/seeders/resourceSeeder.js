import mongoose from "mongoose";
import { connectToDatabase } from "../../config/database.js";
import Resource from "../models/resource.js";

const createResources = async () => {
  await connectToDatabase();

  const resources = [
    {
      topic: "Data Structures",
      description: "Articles related to data structures",
    },
    { topic: "Algorithms", description: "Articles related to algorithms" },
  ];

  try {
    await Resource.insertMany(resources);
    console.log("Resources added");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

createResources();
