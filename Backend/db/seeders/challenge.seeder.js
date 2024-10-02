import { challenges } from "../../resources/challenges/index.js";
import db from "../models/index.js";

const seedChallenges = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const challengeData of challenges) {
      await db.Challenge.findOrCreate({
        where: { title: challengeData.title },
        defaults: {
          description: challengeData.description,
          difficulty: challengeData.difficulty,
          inputFormat: challengeData.inputFormat,
          outputFormat: challengeData.outputFormat,
          exampleInput: challengeData.exampleInput,
          exampleOutput: challengeData.exampleOutput,
          constraints: challengeData.constraints,
          functionSignature: challengeData.functionSignature,
        },
      });
    }

    console.log("Challenges seeded successfully");
  } catch (error) {
    console.error("Error seeding challenges:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedChallenges();
