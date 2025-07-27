import React, { useEffect, useState, useContext } from "react";
import Editor from "@monaco-editor/react";
import { submit, run } from "../api/compiler";
import { readProblems } from "../api/problems";
import { AuthContext } from "../api/authuser";
import LeaderboardPage from "./Leaderboard";
import ContestRegisterPage from "./ContestPage"; // Optional if you toggle contest register UI

function diceCoefficient(str1, str2) {
  if (!str1.length || !str2.length) return 0;
  const bigrams = (s) => {
    const map = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2).toLowerCase();
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };
  const map1 = bigrams(str1);
  const map2 = bigrams(str2);
  let intersection = 0;
  for (const [bg, count] of map1.entries()) {
    if (map2.has(bg)) {
      intersection += Math.min(count, map2.get(bg));
    }
  }
  return (2 * intersection) / (map1.size + map2.size);
}

export default function CodeEditorPage() {
  const { user } = useContext(AuthContext);
  const userId = user.sub;
  const userName = user.name;

  const [problems, setProblems] = useState([]);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  const [similarityScore, setSimilarityScore] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showContestRegister, setShowContestRegister] = useState(false);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const problemsData = await readProblems();
        setProblems(problemsData);

        if (problemsData.length > 0) {
          setSelectedProblemIndex(0);
          setCode(problemsData[0].codeBase || "");
          setSimilarityScore(100);
          setIsSubmitDisabled(false);
          setLanguage("py");
          setInput("");
        } else {
          setIsSubmitDisabled(true);
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
        setIsSubmitDisabled(true);
      }
    }
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedProblemIndex === null || !problems[selectedProblemIndex]) {
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      return;
    }

    const problemCode = problems[selectedProblemIndex].codeBase || "";
    const sim = diceCoefficient(problemCode, code);
    const simPercent = Math.round(sim * 100);
    setSimilarityScore(simPercent);

    const constraintLimit = problems[selectedProblemIndex]?.constraintLimit || 0;
    setIsSubmitDisabled(simPercent < constraintLimit);
  }, [code, selectedProblemIndex, problems]);

  // Handlers
  const handleProblemChange = (e) => {
    const idx = e.target.value;
    if (idx === "") {
      setSelectedProblemIndex(null);
      setCode("");
      setOutput("");
      setInput("");
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      return;
    }
    const i = Number(idx);
    setSelectedProblemIndex(i);
    const selectedProblem = problems[i];
    setCode(selectedProblem.codeBase || "");
    setSimilarityScore(100);
    setIsSubmitDisabled(false);
    setOutput("");
    setInput("");
    setLanguage("py");
  };

  async function callsubmit() {
    if (selectedProblemIndex === null) {
      alert("Please select a problem before submitting.");
      return;
    }
    const problemId = problems[selectedProblemIndex].id;
    const langMapping = {
      py: "py",
      python: "py",
      java: "java",
      cpp: "cpp",
      "c++": "cpp",
    };
    const lang = langMapping[language.toLowerCase()] || "py";

    try {
      const result = await submit(lang, code, problemId, userId, userName, input);
      setOutput(result.output || result.error || "Unknown error during submission");
    } catch {
      setOutput("Error during submission.");
    }
  }

  async function callrun() {
    if (selectedProblemIndex === null) {
      alert("Please select a problem before running.");
      return;
    }
    const langMapping = {
      py: "py",
      python: "py",
      java: "java",
      cpp: "cpp",
      "c++": "cpp",
    };
    const lang = langMapping[language.toLowerCase()] || "py";

    try {
      const result = await run(lang, code, input);
      setOutput(result.output || result.error || "Unknown error during run");
    } catch {
      setOutput("Error during run.");
    }
  }

  if (showLeaderboard) {
    return (
      <>
        <button
          className="mb-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white"
          onClick={() => setShowLeaderboard(false)}
        >
          Back to Editor
        </button>
        <LeaderboardPage />
      </>
    );
  }

  if (showContestRegister) {
    return (
      <>
        <button
          className="mb-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white"
          onClick={() => setShowContestRegister(false)}
        >
          Back to Editor
        </button>
        <ContestRegisterPage />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2a2a3d] text-white font-sans">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-5 space-x-4">
          {/* Problem selector */}
          <select
            id="questionSelector"
            className="flex-grow px-4 py-2 rounded bg-gray-800 text-white text-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={selectedProblemIndex !== null ? selectedProblemIndex : ""}
            onChange={handleProblemChange}
          >
            <option value="">Select a Question</option>
            {problems.map((problem, idx) => (
              <option key={problem.id} value={idx}>
                {`${problem.title} — ${problem.score} pts`}
              </option>
            ))}
          </select>

          {/* Language selector */}
          <select
            id="languageSelector"
            className="w-36 px-4 py-2 rounded bg-gray-800 text-white text-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="py">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            id="copyButton"
            className="flex-grow px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => {
              if (selectedProblemIndex !== null && problems[selectedProblemIndex]) {
                navigator.clipboard.writeText(problems[selectedProblemIndex].codeBase || "");
                alert("Problem's code base copied to clipboard!");
              } else {
                alert("No problem selected or code base is empty.");
              }
            }}
          >
            Copy Code
          </button>

          <button
            onClick={() => setShowContestRegister(true)}
            className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            Register for Contests
          </button>

          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={() => setShowLeaderboard(true)}
          >
            Leaderboard
          </button>
        </div>

        {/* Problem details */}
        <section className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg overflow-y-auto">
          {selectedProblemIndex !== null && problems[selectedProblemIndex] ? (
            <>
              <h2 className="text-2xl font-bold mb-4">{problems[selectedProblemIndex].title}</h2>
              <p className="whitespace-pre-wrap text-md mb-8">{problems[selectedProblemIndex].description}</p>

              <div>
                <h3 className="font-semibold mb-2 text-lg border-b border-gray-700 pb-1">Constraints</h3>
                <p className="mb-6">{problems[selectedProblemIndex].constraintLimit}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg border-b border-gray-700 pb-1">Test Cases</h3>
                <ul className="list-disc list-inside max-h-56 overflow-y-auto space-y-3 text-sm">
                  {problems[selectedProblemIndex].testcases.map((tc, idx) => (
                    <li key={idx} className="bg-gray-700 p-3 rounded shadow-sm">
                      <p>
                        <span className="font-semibold">Input:</span> {tc.input}
                      </p>
                      <p>
                        <span className="font-semibold">Output:</span> {tc.output}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 mt-20 select-none">Select a question to see details</p>
          )}
        </section>

        {/* Output box */}
        <section className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg max-h-36 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
          <strong>Output:</strong>
          <div className="mt-2">{output || "No output yet."}</div>
        </section>

        {/* Input box */}
        <section className="mt-6">
          <label htmlFor="userInput" className="block mb-2 font-semibold text-white">
            Custom Input
          </label>
          <textarea
            id="userInput"
            rows={5}
            className="w-full p-3 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none text-white font-mono"
            placeholder="Type input for your program here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </section>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4 w-full max-w-md">
            <button
              className={`flex-1 rounded px-6 py-3 font-semibold text-white transition-colors duration-200 ${
                isSubmitDisabled ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isSubmitDisabled}
              onClick={callrun}
              title={isSubmitDisabled ? "Cannot run due to low similarity" : ""}
            >
              Run
            </button>
            <button
              className={`flex-1 rounded px-6 py-3 font-semibold text-white transition-colors duration-200 ${
                isSubmitDisabled ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isSubmitDisabled}
              onClick={callsubmit}
              title={isSubmitDisabled ? "Cannot submit due to low similarity" : ""}
            >
              Submit
            </button>
          </div>
          <span className="ml-4 font-mono">{`Code Diff: ${similarityScore}%`}</span>
        </div>

        <Editor
          height="100%"
          language={language === "py" ? "python" : language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            padding: { top: 10 },
            fontFamily: "'Fira Mono', monospace",
          }}
        />
      </div>
    </div>
  );

  async function callsubmit() {
    if (selectedProblemIndex === null) {
      alert("Please select a problem before submitting.");
      return;
    }
    const problemId = problems[selectedProblemIndex].id;
    const langMapping = {
      py: "py",
      python: "py",
      java: "java",
      cpp: "cpp",
      "c++": "cpp",
    };
    const lang = langMapping[language.toLowerCase()] || "py";

    try {
      const result = await submit(lang, code, problemId, userId, userName, input);
      setOutput(result.output || result.error || "Unknown error during submission");
    } catch {
      setOutput("Error during submission.");
    }
  }

  async function callrun() {
    if (selectedProblemIndex === null) {
      alert("Please select a problem before running.");
      return;
    }
    const langMapping = {
      py: "py",
      python: "py",
      java: "java",
      cpp: "cpp",
      "c++": "cpp",
    };
    const lang = langMapping[language.toLowerCase()] || "py";

    try {
      const result = await run(lang, code, input);
      setOutput(result.output || result.error || "Unknown error during run");
    } catch {
      setOutput("Error during run.");
    }
  }
}
