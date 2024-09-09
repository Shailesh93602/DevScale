import db from "../models/index.js";

const roadmaps = [
  {
    title: "Full Stack Web Development",
    description:
      "A comprehensive roadmap to become a Full Stack Web Developer.",
    subjects: ["HTML", "CSS", "JavaScript", "Node.js", "React"],
  },
  {
    title: "Data Science",
    description: "A detailed roadmap to excel in Data Science.",
    subjects: [
      "Python",
      "Statistics",
      "Machine Learning",
      "Data Visualization",
    ],
  },
  {
    title: "Cyber Security",
    description: "A complete roadmap for mastering Cyber Security.",
    subjects: [
      "Networking",
      "Cryptography",
      "Ethical Hacking",
      "Incident Response",
    ],
  },
  {
    title: "Artificial Intelligence",
    description: "A roadmap to dive into Artificial Intelligence.",
    subjects: [
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
    ],
  },
];

const seedRoadMaps = async () => {
  try {
    await db.sequelize.authenticate();

    for (const roadmapData of roadmaps) {
      const [roadmap] = await db.RoadMap.findOrCreate({
        where: { title: roadmapData.title },
        defaults: { description: roadmapData.description },
      });

      for (const subjectName of roadmapData.subjects) {
        const [subject] = await db.Subject.findOrCreate({
          where: { name: subjectName },
          defaults: { description: `${subjectName} description` },
        });

        if (typeof roadmap.addSubject === "function") {
          await roadmap.addSubject(subject);
        } else {
          console.error(
            "The 'addSubject' method is not defined on RoadMap model."
          );
        }
      }
    }

    console.log("Roadmaps and subjects seeded successfully");
  } catch (error) {
    console.error("Error seeding roadmaps and subjects:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedRoadMaps();
