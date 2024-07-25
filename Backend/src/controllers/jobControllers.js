import { logger } from "./../helpers/logger.js";

export const getJobs = async (req, res) => {
  try {
    const jobs = await findAllJobs();
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    logger.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await findJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    logger.error("Error fetching job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, description, company, location } = req.body;
    if (!title || !description || !company || !location) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const newJob = { title, description, company, location };
    await createNewJob(newJob);
    res
      .status(201)
      .json({ success: true, message: "Job created successfully!" });
  } catch (error) {
    logger.error("Error creating job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { title, description, company, location } = req.body;

    if (!title || !description || !company || !location) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const updatedJob = { title, description, company, location };
    const result = await updateExistingJob(jobId, updatedJob);
    if (!result) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Job updated successfully!" });
  } catch (error) {
    logger.error("Error updating job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const result = await deleteJobById(jobId);
    if (!result) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully!" });
  } catch (error) {
    logger.error("Error deleting job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
