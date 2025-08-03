import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const router = express.Router();

let aiAssistanceEnabled = false;

router.get('/enabled', (req, res) => {
  res.json({ enabled: aiAssistanceEnabled });
});

router.post('/enabled', (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: "'enabled' must be a boolean" });
  }

  aiAssistanceEnabled = enabled;
  res.json({ enabled: aiAssistanceEnabled });
});

// POST endpoint to generate AI hint
router.post('/generate-hint', async (req, res) => {
  const { problemDescription, codeBase } = req.body;

  if (typeof problemDescription !== 'string' || typeof codeBase !== 'string') {
    return res.status(400).json({ error: "'problemDescription' and 'codeBase' must be strings" });
  }

  try {
    const prompt = `You are an assistant helping coding challenge participants.\nProvide a minimal helpful hint for the following problem:\n\n${problemDescription}\n\nBase Code:\n${codeBase}\n\nHint:`;

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const hint = result?.response?.text().trim() || 'No hint generated.';

    res.json({ hint });
  } catch (error) {
    console.error('Gemini hint generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate hint' });
  }
});

export default router;
