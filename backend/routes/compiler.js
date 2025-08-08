import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios'; 
const router = express.Router();

const API_URL = `${process.env.COMPILER_IP}`;

const PROBLEM_API_BASE = `${process.env.BACKEND_IP}/api/problems`; 

function handleApiError(res, error, defaultMsg = "Server error") {
  console.error(error);
  if (!res.headersSent) {
    res.status(500).json({ error: defaultMsg });
  }
}

// POST /submit — fetch problem testcases, forward to compiler, then save submission record here
router.post('/submit', async (req, res) => {
  const { lang, code, problemId, userId, contestId, userName, input = '' } = req.body;

  if (!lang || !code || !problemId) {
    return res.status(400).json({ error: "Missing required fields: 'lang', 'code', 'problemId'." });
  }

  try {
    const problemResponse = await fetch(`${PROBLEM_API_BASE}/${problemId}`);
    if (!problemResponse.ok) {
      return res.status(502).json({ error: "Failed to fetch problem details" });
    }
    const problemData = await problemResponse.json();
    const testcases = problemData.testcases || [];

    const submitPayload = {
      format: lang,
      code,
      problemId,
      userId,
      contestId,
      userName,
      input,
      testcases,
    };

    const compilerResponse = await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitPayload),
    });

    if (!compilerResponse.ok) {
      const text = await compilerResponse.text();
      return res.status(502).json({ error: "Compiler service error", detail: text });
    }

    const data = await compilerResponse.json();
    const submissionId = data.uuid || null;
    const finalScore = data.finalScore ?? 0;
    const finalResult = data.finalResult || (data.success ? "Accepted" : "Failed");
    const totalTime = data.totalTime || null;

    if (!submissionId) {
      console.warn("No submissionId returned from compiler API; skipping submission record save.");
      return res.json(data);
    }

    try {
      await axios.post(`${process.env.BACKEND_IP}/api/submissions`, {
        problem: problemId,
        user: userId,
        contestId,
        submissionId,
        username: userName,
        score: finalScore,
        result: finalResult,
        time: totalTime,
        memory: null, 
      });
    } catch (submissionSaveError) {
      console.error("Error saving submission record:", submissionSaveError);
    }
    res.json(data);

  } catch (error) {
    handleApiError(res, error, "Submission failed");
  }
});

// /run 
router.post('/run', async (req, res) => {
  const { lang, code, input = '' } = req.body;

  if (!lang || !code) {
    return res.status(400).json({ error: "Missing required fields: 'lang', 'code'." });
  }

  try {
    const response = await fetch(`${API_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: lang, code, input }),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    handleApiError(res, error, "Execution failed");
  }
});

export default router;
