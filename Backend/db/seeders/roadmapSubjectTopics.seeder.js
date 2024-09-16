import db from "../models/index.js";
import { roadmaps } from "../../resources/roadmaps/roadmap.js";

const seedDatabase = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const roadmapData of roadmaps) {
      const [roadmap] = await db.RoadMap.findOrCreate({
        where: { title: roadmapData.title },
        defaults: {
          description: roadmapData.description,
        },
      });

      for (const mainConceptData of roadmapData.mainConcepts) {
        const [mainConcept] = await db.MainConcept.findOrCreate({
          where: { name: mainConceptData.name },
          defaults: {
            description: mainConceptData.description,
            roadmapId: roadmap.id,
          },
        });

        for (const subjectData of mainConceptData.subjects) {
          const [subject, created] = await db.Subject.findOrCreate({
            where: { name: subjectData.name },
            defaults: {
              description: subjectData.description,
              mainConceptId: mainConcept.id,
            },
          });

          if (!created && subject.mainConceptId !== mainConcept.id) {
            await subject.update({ mainConceptId: mainConcept.id });
          }

          for (const topicData of subjectData.topics) {
            await db.Topic.findOrCreate({
              where: { title: topicData.name },
              defaults: {
                description: topicData.description,
                subjectId: subject.id,
              },
            });
          }
        }
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedDatabase();
