import Editor from "@monaco-editor/react";
import { submit, run } from "../api/compiler";
import { readProblems } from "../api/problems"; 
import { useState, useEffect } from "react";

export default function CodeEditorPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [output, setOutput] = useState("");

  const [problems, setProblems] = useState([]);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(null);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const problemsData = await readProblems();
        setProblems(problemsData);

        if (problemsData.length > 0) {
          setSelectedProblemIndex(0);
          setCode(problemsData[0].codeBase || "");
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
      }
    }
    fetchProblems();
  }, []);

  const handleProblemChange = (e) => {
    const idx = e.target.value;
    if (idx !== "") {
      setSelectedProblemIndex(Number(idx));
      const selectedProblem = problems[Number(idx)];
      setCode(selectedProblem.codeBase || "");
      setLanguage("py");
      setOutput("");
    }
  };

  async function callsubmit() {
    const result = await submit(language, code);
    console.log(result);
    if (result.output) {
      setOutput(result.output);
    } else {
      setOutput(result.error);
    }
  }
  async function callrun() {
    const result = await run(language, code);
    console.log(result);
    if (result.output) {
      setOutput(result.output);
    } else {
      setOutput(result.error);
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2a2a3d] text-white font-sans">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col p-4 relative">
        <div className="flex justify-between mb-4">
          <select
            id="questionSelector"
            className="px-4 py-2 rounded bg-gray-700 text-white text-sm"
            value={selectedProblemIndex !== null ? selectedProblemIndex : ""}
            onChange={handleProblemChange}
          >
            <option value="">Select a Question</option>
            {problems.map((problem, idx) => (
              <option key={problem.id} value={idx}>
                {`${problem.title}: ${problem.score} points`}
              </option>
            ))}
          </select>

          <select
            id="languageSelector"
            className="px-4 py-2 rounded bg-gray-700 text-white text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="py">Python</option>
            <option value="java">Java</option>
          </select>

          <button
            id="copyButton"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white text-sm"
            onClick={() => {
              navigator.clipboard.writeText(code);
              alert("Code copied to clipboard!");
            }}
          >
            Copy Code
          </button>
        </div>

        <div
          id="questionBox"
          className="flex-1 bg-[#29293d] p-4 rounded-lg overflow-y-auto shadow mb-4"
        >
          {selectedProblemIndex !== null ? (
            <>
              <h3 className="text-lg font-bold mb-2">
                {problems[selectedProblemIndex].title}
              </h3>
              <p className="text-sm whitespace-pre-wrap">
                {problems[selectedProblemIndex].description}
              </p>
              <h4 className="mt-4 mb-2 font-semibold">Constraints:</h4>
              <p>{problems[selectedProblemIndex].constraintLimit}</p>
              <h4 className="mt-4 mb-2 font-semibold">Test Cases:</h4>
              <ul className="list-disc list-inside text-sm max-h-40 overflow-auto">
                {problems[selectedProblemIndex].testcases.map((tc, idx) => (
                  <li key={idx}>
                    <strong>Input:</strong> {tc.input} <br />
                    <strong>Output:</strong> {tc.output}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Select a question to see the details</p>
          )}
        </div>

        <div
          id="outputBox"
          className="bg-[#1a1a26] text-gray-200 p-4 rounded-lg shadow mb-4 whitespace-pre-wrap"
        >
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>

        <div className="bg-[#232334] p-4 rounded-lg shadow">
          <label htmlFor="userInput" className="block font-bold mb-2">
            Enter Input:
          </label>
          <textarea
            id="userInput"
            className="w-full h-[100px] bg-[#1a1a26] text-white text-sm p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your input here..."
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              id="runButton"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-800 rounded text-white"
              onClick={callrun}
            >
              Run
            </button>
            <button
              id="submitButton"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-800 rounded text-white"
              onClick={callsubmit}
            >
              Submit
            </button>
          </div>
          <p id="similarity_score" className="text-sm ml-4">
            Code Diff: 0%
          </p>
        </div>

        <Editor
          height="100%"
          language={language === "py" ? "python" : language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  );
}
