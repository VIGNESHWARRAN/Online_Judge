import express from "express";
import cors from "cors";
import axios from "axios";
import { generateFile } from "./generateFile.js";
import { executePy } from "./executePy.js";
import { executeJava } from "./executeJava.js";
import { executeCpp } from "./executeCpp.js";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const compiler = express();

// Middleware
compiler.use(cors());
compiler.use(express.urlencoded({ extended: true }));
compiler.use(express.json());

// Output directory for submission logs
const outputPath = path.join(path.resolve(), "outputs");
if (!fsSync.existsSync(outputPath)) {
  fsSync.mkdirSync(outputPath, { recursive: true });
}

// Submissions source code save directory
const submissionsDir = path.join(path.resolve(), "submissions");
if (!fsSync.existsSync(submissionsDir)) {
  fsSync.mkdirSync(submissionsDir, { recursive: true });
}

// Function to return executor based on language
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

// POST /submit endpoint: run all testcases and save output logs ONLY, no submission API call
compiler.post("/submit", async (req, res) => {
  const { format, code, problemId, userId, contestId, userName, testcases } = req.body;

  if (!code) return res.status(400).json({ success: false, error: "Code not provided" });
  if (!problemId) return res.status(400).json({ success: false, error: "Problem ID not provided" });
  if (!userId) return res.status(400).json({ success: false, error: "User ID not provided" });

  const executor = getExecutor(format);
  if (!executor) return res.status(400).json({ success: false, error: `Unsupported language: ${format}` });

  if (!testcases || !testcases.length) {
    return res.status(400).json({ success: false, error: "No testcases found for the problem" });
  }

  try {
    // Generate unique temp source code file with generated uuid
    const { filepath, uuid } = await generateFile(format, code);

    let totalTime = 0;
    let hasError = false;
    let failReason = null;
    let failOutput = null;

    // Run all testcases sequentially
    for (let i = 0; i < testcases.length; i++) {
      const testcase = testcases[i];
      const inputStr = testcase.input || "";
      const expectedOutput = (testcase.output || "").trim().replace(/\r\n/g, "\n");

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

    // Determine final verdict and score
    const finalResult = hasError
      ? failReason.startsWith("Wrong Answer")
        ? "Wrong Answer"
        : "Runtime Error"
      : "Accepted";

    // Since the compiler does not fetch the problem’s score here, you can send 0 or handle it upstream
    const finalScore = finalResult === "Accepted" ? 0 : 0;

    // Save output log **only for submissions**
    const outputFilePath = path.join(outputPath, `${uuid}.out`);
    const outputLog = hasError ? `${finalResult}\n\n${failOutput || ""}` : "All testcases passed!";
    await fs.writeFile(outputFilePath, outputLog);

    // Save submitted source code file permanently
    const savedSourcePath = path.join(submissionsDir, `${uuid}.${format}`);
    await fs.copyFile(filepath, savedSourcePath);

    // Cleanup temporary source file (do not delete saved source file)
    try {
      await fs.unlink(filepath);
    } catch (cleanupErr) {
      console.error("Error deleting temp source file:", cleanupErr);
    }

    // Respond with the result only; NO submission API call here
    if (hasError) {
      return res.json({ success: false, error: finalResult, detail: failOutput, uuid, totalTime, finalScore, finalResult });
    } else {
      return res.json({ success: true, output: "All testcases passed!", uuid, totalTime, finalScore, finalResult });
    }
  } catch (error) {
    console.error("Error in /submit:", error);
    return res.status(500).json({ success: false, error: "Internal server error", detail: error.message || "Unknown error" });
  }
});

// POST /run endpoint: run code once with optional input; no output file saved
compiler.post("/run", async (req, res) => {
  const { format, code, input } = req.body;
  const lang = (format || "").toLowerCase();

  const tempDir = path.resolve("./codes");
  if (!fsSync.existsSync(tempDir)) {
    fsSync.mkdirSync(tempDir, { recursive: true });
  }
  const uniqueId = uuidv4();
  let filename;

  switch (lang) {
    case "py":
    case "python":
      filename = `run_${uniqueId}.py`;
      break;
    case "cpp":
    case "c++":
      filename = `run_${uniqueId}.cpp`;
      break;
    case "java":
      filename = `run_${uniqueId}.java`;
      break;
    default:
      return res.status(400).json({ success: false, error: "Unsupported language" });
  }

  const filePath = path.join(tempDir, filename);

  try {
    // Write source code to temp file
    await fs.writeFile(filePath, code);

    let result;
    if (lang === "py" || lang === "python") {
      result = await executePy(filePath, input || "");
    } else if (lang === "cpp" || lang === "c++") {
      result = await executeCpp(filePath, input || "");
    } else if (lang === "java") {
      result = await executeJava(filePath, input || "");
    }

    if (result.error) {
      return res.json({ success: false, error: result.error, detail: result.detail || "" });
    }

    return res.json({ success: true, output: result.output, time: result.time, memory: result.memory });
  } catch (err) {
    console.error("Error running code:", err);
    return res.status(500).json({ success: false, error: "Internal server error", detail: err.message });
  } finally {
    // Cleanup temp source file
    try {
      await fs.unlink(filePath);
    } catch (cleanupErr) {
      console.error("Error deleting temp run file:", cleanupErr);
    }
  }
});

// Start server
compiler.listen(5175, (error) => {
  if (error) {
    console.error("Error starting the server:", error);
  } else {
    console.log("✅ Server started on port 5175");
  }
});

export default compiler;
