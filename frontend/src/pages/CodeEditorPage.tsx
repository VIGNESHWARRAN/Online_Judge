import Editor from "@monaco-editor/react";
import { submit, run } from "../api/compiler";
import { readProblems } from "../api/problems";
import { useState, useEffect } from "react";
import Leaderboard from './Leaderboard';

function diceCoefficient(str1, str2) {
  if (!str1.length || !str2.length) return 0;

  const bigrams = (str) => {
    const s = str.toLowerCase();
    const map = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2);
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };

  const bigrams1 = bigrams(str1);
  const bigrams2 = bigrams(str2);

  let intersection = 0;
  for (const [bg, count] of bigrams1.entries()) {
    if (bigrams2.has(bg)) {
      intersection += Math.min(count, bigrams2.get(bg));
    }
  }

  const totalBigrams = bigrams1.size + bigrams2.size;
  return (2 * intersection) / totalBigrams;
}

export default function CodeEditorPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState(""); // For program inputs

  const [problems, setProblems] = useState([]);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(null);

  const [similarityScore, setSimilarityScore] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Sample userId, replace with real user from auth/context
  const userId = "auth0|687fce081ce1c4c3e85f4c4b";

  // Load problems on mount
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
          // Set language per problem extension if available? Here default "py"
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

  // Update code similarity and submit button disable state
  useEffect(() => {
    if (selectedProblemIndex === null) {
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      return;
    }

    const problemCode = problems[selectedProblemIndex]?.codeBase || "";
    const sim = diceCoefficient(problemCode, code);
    const simPercent = Math.round(sim * 100);
    setSimilarityScore(simPercent);

    const constraintLimit = problems[selectedProblemIndex]?.constraintLimit || 0;
    setIsSubmitDisabled(simPercent < constraintLimit);
  }, [code, selectedProblemIndex, problems]);

  // Handle problem change
  const handleProblemChange = (e) => {
    const idx = e.target.value;
    if (idx !== "") {
      const i = Number(idx);
      setSelectedProblemIndex(i);
      const selectedProblem = problems[i];
      setCode(selectedProblem.codeBase || "");
      // Set language per problem if you have that info, else fallback
      setLanguage("py"); 
      setOutput("");
      setInput(""); // reset input
    } else {
      setSelectedProblemIndex(null);
      setCode("");
      setOutput("");
      setInput("");
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
    }
  };

  // Call submit API function with language mapping
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
      "c++": "cpp"
    };

    const lang = langMapping[language.toLowerCase()] || "py";

    const result = await submit(lang, code, problemId, userId, input);
    console.log(result);
    if (result.output) {
      setOutput(result.output);
    } else {
      setOutput(result.error || "Unknown error during submission");
    }
  }

  // Call run API function with language mapping
  async function callrun() {
    const langMapping = {
      py: "py",
      python: "py",
      java: "java",
      cpp: "cpp",
      "c++": "cpp"
    };

    const lang = langMapping[language.toLowerCase()] || "py";

    const result = await run(lang, code, input);
    console.log(result);
    if (result.output) {
      setOutput(result.output);
    } else {
      setOutput(result.error || "Unknown error during run");
    }
  }

  if (showLeaderboard) {
    return (
      <>
        <button
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white text-sm mb-4"
          onClick={() => setShowLeaderboard(false)}
        >
          Back to Editor
        </button>
        <Leaderboard />
      </>
    );
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
            <option value="cpp">C++</option>
          </select>

          <button
            id="copyButton"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white text-sm"
            onClick={() => {
              if (selectedProblemIndex !== null && problems[selectedProblemIndex]) {
                navigator.clipboard.writeText(problems[selectedProblemIndex].codeBase || '');
                alert("Problem's code base copied to clipboard!");
              } else {
                alert("No problem selected or code base is empty.");
              }
            }}
          >
            Copy Code
          </button>

          {/* Leaderboard button */}
          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-800 text-white text-sm"
            onClick={() => setShowLeaderboard(true)}
          >
            Leaderboard
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
                    <strong>Test case</strong> {idx + 1} <br />
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

        {/* User Input textarea */}
        <div className="bg-[#232334] p-4 rounded-lg shadow">
          <label htmlFor="userInput" className="block font-bold mb-2">
            Enter Input:
          </label>
          <textarea
            id="userInput"
            className="w-full h-[100px] bg-[#1a1a26] text-white text-sm p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your input here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
              className={`px-4 py-2 rounded text-white ${
                isSubmitDisabled
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-800"
              }`}
              onClick={callsubmit}
              disabled={isSubmitDisabled}
            >
              Submit
            </button>
          </div>
          <p id="similarity_score" className="text-sm ml-4">
            Code Diff: {similarityScore}%
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
