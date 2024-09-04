import db from "../models/index.js";

const roadmapSubjects = [
  {
    roadmapTitle: "Full Stack Web Development",
    subjectNames: [
      "C Language",
      "Data Structures and Algorithms",
      "Object-Oriented Programming",
      "Database Systems",
      "Computer Networks",
    ],
  },
  {
    roadmapTitle: "Data Science",
    subjectNames: [
      "Data Structures and Algorithms",
      "Discrete Mathematics",
      "Machine Learning",
      "Artificial Intelligence",
    ],
  },
  {
    roadmapTitle: "Cyber Security",
    subjectNames: ["Operating Systems", "Computer Networks", "Cyber Security"],
  },
  {
    roadmapTitle: "Artificial Intelligence",
    subjectNames: [
      "Discrete Mathematics",
      "Artificial Intelligence",
      "Machine Learning",
    ],
  },
];

const seedRoadMapSubjects = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const roadmapSubject of roadmapSubjects) {
      const roadmap = await db.RoadMap.findOne({
        where: { title: roadmapSubject.roadmapTitle },
      });

      if (roadmap) {
        for (const subjectName of roadmapSubject.subjectNames) {
          const subject = await db.Subject.findOne({
            where: { name: subjectName },
          });

          if (subject) {
            await roadmap.addSubject(subject);
          }
        }
      }
    }

    console.log("RoadMapSubjects seeded successfully");
  } catch (error) {
    console.error("Error seeding RoadMapSubjects:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedRoadMapSubjects();
