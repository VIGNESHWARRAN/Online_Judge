import express from "express";
import cors from "cors";
import axios from "axios";
import { generateFile } from "./generateFile.js";
import { executePy } from "./executePy.js";
import { executeJava } from "./executeJava.js";
import { executeCpp } from "./executeCpp.js";
import { writeFile } from "fs/promises";

const compiler = express();
compiler.use(cors());
compiler.use(express.urlencoded({ extended: true }));
compiler.use(express.json());

function getExecutor(format) {
  switch (format.toLowerCase()) {
    case "py":
    case "python":
      return executePy;
    case "java":
      return executeJava;
    case "cpp":
    case "c++":
      return executeCpp;
    default:
      return null;
  }
}

// POST /submit endpoint: runs all testcases for the given problem
compiler.post("/submit", async (req, res) => {
  const { format, code, problemId, userId, userName } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Code not provided" });
  }
  if (!problemId) {
    return res.status(400).json({ success: false, error: "Problem ID not provided" });
  }
  if (!userId) {
    return res.status(400).json({ success: false, error: "User ID not provided" });
  }

  const executor = getExecutor(format);
  if (!executor) {
    return res.status(400).json({ success: false, error: `Unsupported language: ${format}` });
  }

  try {
    // Fetch problem details including testcases
    const problemRes = await axios.get(`http://localhost:5174/api/problems/${problemId}`);
    const problem = problemRes.data;
    const testcases = problem.testcases || [];

    if (!testcases.length) {
      return res.status(400).json({ success: false, error: "No testcases found for the problem" });
    }

    // Generate temp file
    const filepath = await generateFile(format, code);

    let totalTime = 0;
    let hasError = false;
    let failReason = null;
    let failOutput = null;

    for (let i = 0; i < testcases.length; i++) {
      const testcase = testcases[i];
      const inputStr = testcase.input || "";
      const expectedOutput = (testcase.output || "").trim().replace(/\r\n/g, "\n");

      // Execute user code with testcase input (depending on language)
      const result = await executor(filepath, inputStr);

      totalTime += result.time || 0;

      if (result.error) {
        hasError = true;
        failReason = "Runtime Error";
        failOutput = result.error + (result.detail ? "\nDetails: " + result.detail : "");
        break;
      }

      const actualOutput = (result.output || "").trim().replace(/\r\n/g, "\n");

      if (actualOutput !== expectedOutput) {
        hasError = true;
        failReason = `Wrong Answer on Testcase ${i + 1}`;
        failOutput = `Expected:\n${expectedOutput}\nGot:\n${actualOutput}`;
        break;
      }
    }


    const finalResult = hasError
      ? failReason.startsWith("Wrong Answer")
        ? "Wrong Answer"
        : "Runtime Error"
      : "Accepted";

    const finalScore = finalResult === "Accepted" ? (problem.score || 0) : 0;

    await axios.post("http://localhost:5174/api/submissions", {
      problem: problemId,
      user: userId,
      username: userName,
      score: finalScore,
      result: finalResult,
      time: totalTime || null,
      memory: null,
    });

    if (hasError) {
      return res.json({
        success: false,
        error: finalResult,
        detail: failOutput,
      });
    } else {
      return res.json({
        success: true,
        output: "All testcases passed!",
        totalTime,
      });
    }
  } catch (error) {
    console.error("Error in /submit:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      detail: error.message || "Unknown error",
    });
  }
});

// POST /run endpoint: run single code with optional input
compiler.post('/run', async (req, res) => {
  const { format, code, input } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Code not provided' });
  }

  // Normalize format for safety
  const lang = format?.toLowerCase();

  try {
    let filePath;

    switch (lang) {
      case 'py':
      case 'python':
        filePath = './codes/run.py';
        await writeFile(filePath, code);
        const pyResult = await executePy(filePath, input || '');
        if (pyResult.error) {
          return res.json({ success: false, error: pyResult.error, detail: pyResult.detail || '' });
        }
        return res.json({ success: true, output: pyResult.output, time: pyResult.time, memory: pyResult.memory });

      case 'cpp':
      case 'c++':
        filePath = './codes/run.cpp';
        await writeFile(filePath, code);
        const cppResult = await executeCpp(filePath, input || '');
        if (cppResult.error) {
          return res.json({ success: false, error: cppResult.error, detail: cppResult.detail || '' });
        }
        return res.json({ success: true, output: cppResult.output, time: cppResult.time, memory: cppResult.memory });

      case 'java':
        filePath = './codes/run.java';
        await writeFile(filePath, code);
        const javaResult = await executeJava(filePath, input || '');
        if (javaResult.error) {
          return res.json({ success: false, error: javaResult.error, detail: javaResult.detail || '' });
        }
        return res.json({ success: true, output: javaResult.output, time: javaResult.time, memory: javaResult.memory });

      default:
        return res.status(400).json({ success: false, error: 'Unsupported language' });
    }
  } catch (error) {
    console.error('Error in /run:', error);
    return res.status(500).json({ success: false, error: 'Internal server error', detail: error.message || 'Unknown error' });
  }
});

compiler.listen(5175, (error) => {
  if (error) {
    console.error("Error while starting the server:", error);
  } else {
    console.log("✅ Server started on port 5175");
  }
});
