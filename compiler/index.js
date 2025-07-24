import express from "express";
import cors from "cors"
import { generateFile } from "./generateFile.js";
import { executePy } from "./executePy.js";

const compiler = express();
compiler.use(cors());
compiler.use(express.urlencoded({extended: true}));
compiler.use(express.json());

compiler.post("/submit", async (req, res) => {
  const { format , code } = req.body;
  if (code == undefined) {
    return res.status(404).json({ success: false, error: "Empty code" });
  }

  try {
    const filePath = await generateFile(format, code);
    const output = await executePy(filePath);
    return res.json(output);
  } catch (error) {
   console.error("Error occurred:", error);
res.status(500).json({ error: error.message || "Unknown error" });
  }
});


compiler.post("/run",async (req,res) => {
    const {language = "Python", code } = req.body;
    if(code == undefined){
        return res.status(404).json({success: false, error: 'Empty code'});
    }
    try{
        const filePath = generateFile(language, code);
        const output = await executePy(filePath);
        return res.json({output});
    }
    catch(error){
        res.status(500).json({error:error});
    }
});


compiler.listen(5175, (error) => {
    if(error){
        console.log("Error while running the server!");
    } else {
        console.log("Server started on port: 5175");
    }
})