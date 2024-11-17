import { logger } from "./../helpers/logger.js";

export const getForums = async (req, res) => {
  try {
    const forums = await findAllForums({
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json({ success: true, forums });
  } catch (error) {
    logger.error("Error fetching forums:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getForum = async (req, res) => {
  try {
    const forumId = req.params.id;
    const forum = await findForumById(forumId);
    if (!forum) {
      return res
        .status(404)
        .json({ success: false, message: "Forum not found" });
    }
    res.status(200).json({ success: true, forum });
  } catch (error) {
    logger.error("Error fetching forum:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createForum = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const newForum = { title, description, user_id: req.user.id };
    await insertForum(newForum);
    res
      .status(201)
      .json({ success: true, message: "Forum created successfully!" });
  } catch (error) {
    logger.error("Error creating forum:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateForum = async (req, res) => {
  try {
    const forumId = req.params.id;
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const updatedForum = { title, description };
    const result = await updateForumById(forumId, updatedForum);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Forum not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Forum updated successfully!" });
  } catch (error) {
    logger.error("Error updating forum:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteForum = async (req, res) => {
  try {
    const forumId = req.params.id;
    const result = await deleteForumById(forumId);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Forum not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Forum deleted successfully!" });
  } catch (error) {
    logger.error("Error deleting forum:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
