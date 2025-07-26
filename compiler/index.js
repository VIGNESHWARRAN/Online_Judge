import express from "express";
import cors from "cors";
import axios from "axios"
import { generateFile } from "./generateFile.js";
import { executePy } from "./executePy.js";
import { writeFile } from "fs/promises";

const compiler = express();
compiler.use(cors());
compiler.use(express.urlencoded({ extended: true }));
compiler.use(express.json());

compiler.post("/submit", async (req, res) => {
  const { format, code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "",
    });
  }

  try {
    const filePath = await generateFile(format, code);
    const result = await executePy(filePath);
    await axios.post("http://localhost:5174/api/submissions", {
      problem: "64e4d0bfc392c2a8f89e4f3b",
      user: "64e4d0bfc392c2a8f89e4f3b",
      result: "Accepted",
      time: result.time || null,
      memory: result.memory || null,
    });
    if (result.error) {
      return res.json({
        success: false,
        error: result.error,
        detail: result.detail || "",
      });
    }

    return res.json({
      success: true,
      output: result.output,
    });

  } catch (error) {
    console.error("Error in /submit:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      detail: error.message || "Unknown error",
    });
  }
});

compiler.post("/run", async (req, res) => {
  const { format, code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "",
    });
  }

  try {
    const filePath = "./codes/run.py";
    await writeFile(filePath, code);
    const result = await executePy(filePath);

    if (result.error) {
      return res.json({
        success: false,
        error: result.error,
        detail: result.detail || "",
      });
    }

    return res.json({
      success: true,
      output: result.output,
    });

  } catch (error) {
    console.error("Error in /run:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      detail: error.message || "Unknown error",
    });
  }
});

compiler.listen(5175, (error) => {
  if (error) {
    console.error("Error while starting the server:", error);
  } else {
    console.log("✅ Server started on port 5175");
  }
});
