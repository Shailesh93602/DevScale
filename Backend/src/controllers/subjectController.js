import db from "../../db/models/index.js";

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await db.Subject.findAll({
      include: [
        {
          model: db.MainConcept,
          attributes: ["id", "name"],
          order: [["createdAt", "ASC"]],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTopicsInSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const subject = await db.Subject.findByPk(id, {
      include: [
        {
          model: db.Topic,
          attributes: ["id", "title", "description"],
          order: [["createdAt", "ASC"]],
          include: [
            {
              model: db.Article,
              attributes: ["id", "title", "content"],
              where: { status: "approved" },
              required: false,
              order: [["createdAt", "ASC"]],
            },
          ],
        },
      ],
    });
    if (subject) {
      res.status(200).json(subject.Topics);
    } else {
      res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
