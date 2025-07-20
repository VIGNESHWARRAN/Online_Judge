import Submission from '../models/submission.js';

// CREATE
export const createSubmission = async (req, res) => {
  try {
    const submission = new Submission(req.body);
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ ALL (optionally filter by user/problem via query params)
export const getSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.problem) filter.problem = req.query.problem;
    const submissions = await Submission.find(filter).populate('user problem');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ ONE
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('user problem');
    if (!submission) return res.status(404).json({ error: "Not found" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE (typically only for status updates)
export const updateSubmission = async (req, res) => {
  try {
    const updated = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE (optional)
export const deleteSubmission = async (req, res) => {
  try {
    const deleted = await Submission.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
