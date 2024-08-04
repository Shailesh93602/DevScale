"use strict";

import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import config from "../../config/config.js";
import { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
const db = {};

async function loadModels() {
  try {
    const modelFiles = fs.readdirSync(__dirname).filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file !== "index.js" &&
        file.slice(-3) === ".js"
      );
    });

    for (const file of modelFiles) {
      const modelPath = path.join(__dirname, file);
      const modelURL = pathToFileURL(modelPath).href;
      try {
        const { default: model } = await import(modelURL);
        const modelInstance = model(sequelize, Sequelize.DataTypes);
        db[modelInstance.name] = modelInstance;
      } catch (importError) {
        console.error(`Error importing model ${file}:`, importError);
      }
    }

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
  } catch (error) {
    console.error("Error loading models:", error);
    throw error;
  }
}

export { loadModels };
export default db;
