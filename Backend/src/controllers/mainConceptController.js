import db from "../../db/models/index.js";

export const getSubjectsInMainConcept = async (req, res) => {
  const { mainConceptId } = req.params;
  try {
    const mainConcept = await db.MainConcept.findByPk(mainConceptId, {
      include: [
        {
          model: db.Subject,
          attributes: ["id", "name", "description"],
        },
      ],
    });
    if (mainConcept) {
      res.status(200).json(mainConcept.Subjects);
    } else {
      res.status(404).json({ message: "Main Concept not found" });
    }
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
