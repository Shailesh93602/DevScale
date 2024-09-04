import db from "../models/index.js";

const roadmaps = [
  {
    title: "Full Stack Web Development",
    description:
      "A comprehensive roadmap to become a Full Stack Web Developer.",
  },
  {
    title: "Data Science",
    description: "A detailed roadmap to excel in Data Science.",
  },
  {
    title: "Cyber Security",
    description: "A complete roadmap for mastering Cyber Security.",
  },
  {
    title: "Artificial Intelligence",
    description: "A roadmap to dive into Artificial Intelligence.",
  },
];

const seedRoadMaps = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const roadmap of roadmaps) {
      await db.RoadMap.findOrCreate({
        where: { title: roadmap.title },
        defaults: roadmap,
      });
    }

    console.log("Roadmaps seeded successfully");
  } catch (error) {
    console.error("Error seeding roadmaps:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedRoadMaps();
