import React, { useEffect, useState, useContext } from "react";
import { readUser } from "../api/users";
import { readProblems } from "../api/problems";
import { readContests } from "../api/contests";
import { AuthContext } from "../api/authuser";
import HeaderControls from "../components/HeaderControls";
import ProblemSelector from "../components/ProblemSelector";
import ProblemDetails from "../components/ProblemDetails";
import OutputConsole from "../components/OutputConsole";
import InputBox from "../components/InputBox";
import EditorPanel from "../components/EditorPanel";
import LeaderboardPage from "./Leaderboard";
import ContestRegisterPage from "./ContestPage";
import SubmissionsPage from "./SubmissionsPage";
import { submitCode, runCode } from "../api/compiler";

import {
  fetchAiAssistanceEnabled,
  generateAIHint,
} from "../api/aiService";

// Dice Coefficient utility
function diceCoefficient(str1: string, str2: string): number {
  if (!str1.length || !str2.length) return 0;
  const bigrams = (s: string): Map<string, number> => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2).toLowerCase();
      map.set(bg, (map.get(bg) ?? 0) + 1);
    }
    return map;
  };
  const sumValues = (map: Map<string, number>): number => {
    let sum = 0;
    for (const count of map.values()) sum += count;
    return sum;
  };
  const map1 = bigrams(str1);
  const map2 = bigrams(str2);
  let intersection = 0;
  for (const [bg, count] of map1.entries()) {
    if (map2.has(bg)) intersection += Math.min(count, map2.get(bg)!);
  }
  const total = sumValues(map1) + sumValues(map2);
  if (total === 0) return 0;
  return (2 * intersection) / total;
}

export default function CodeEditorPage() {
  const { user } = useContext(AuthContext);
  const userId = user?.sub || "";
  const userName = user?.name || "";

  const [problems, setProblems] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [userContestId, setUserContestId] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("py");
  const [output, setOutput] = useState<string>("");
  const [input, setInput] = useState<string>("");

  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showContestRegister, setShowContestRegister] = useState<boolean>(false);
  const [showSubmissions, setSubmissions] = useState(false);

  const [codeInitialized, setCodeInitialized] = useState<boolean>(false);

  // AI Assistance hooks
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState("");

  // Fetch AI Assistance enabled flag on userId change
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const enabled = await fetchAiAssistanceEnabled();
        setAiEnabled(enabled);
      } catch (e) {
        setAiEnabled(false);
        console.error("Failed to fetch AI assistance toggle", e);
      }
    })();
  }, [userId]);

  // Data fetch
  useEffect(() => {
    if (!userId) return;
    async function fetchAllData() {
      try {
        const [userData, problemData, contestData] = await Promise.all([
          readUser(userId),
          readProblems(),
          readContests(),
        ]);
        setUserContestId(userData?.contest || null);

        const normalizedContests = (contestData || []).map((c) => ({
          ...c,
          problems: c.problems || [],
          id: c.id || c._id,
        }));

        setContests(normalizedContests);
        setProblems(problemData);
        setCodeInitialized(false);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }
    fetchAllData();
  }, [userId]);

  const currentContest = contests.find((c) => c.id === userContestId);
  const allContestProblemIds = new Set<string>(contests.flatMap((c) => c.problems || []));

  // Is contest live
  const isContestLive =
    currentContest && currentContest.start && currentContest.end
      ? (() => {
        const now = new Date();
        const start = new Date(currentContest.start);
        const end = new Date(currentContest.end);
        return now >= start && now <= end;
      })()
      : false;

  // Filtered problems
  const filteredProblems =
    userContestId && isContestLive
      ? problems.filter((p) => currentContest?.problems.includes(p.id))
      : problems.filter((p) => !allContestProblemIds.has(p.id));

  // Code/selection init
  useEffect(() => {
    if (filteredProblems.length === 0) {
      setSelectedIndex(null);
      setCode("");
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      setInput("");
      setOutput("");
      setCodeInitialized(true);
      setAiHint("");
      return;
    }
    if (!codeInitialized) {
      setSelectedIndex(0);
      setCode(filteredProblems[0].codeBase || "");
      setSimilarityScore(100);
      setIsSubmitDisabled(false);
      setLanguage("py");
      setInput("");
      setOutput("");
      setCodeInitialized(true);
      setAiHint("");
    }
  }, [filteredProblems, codeInitialized]);

  // Similarity / submit enabled logic
  useEffect(() => {
    if (selectedIndex === null || !filteredProblems[selectedIndex]) {
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      setAiHint("");
      return;
    }
    const prob = filteredProblems[selectedIndex];
    const similarity = diceCoefficient(prob.codeBase || "", code);
    const scorePercent = Math.round(similarity * 100);

    setSimilarityScore(scorePercent);
    setIsSubmitDisabled(scorePercent < (prob.constraintLimit || 0));
  }, [code, selectedIndex, filteredProblems]);

  // Submit handler
  const handleSubmit = async () => {
    if (selectedIndex === null) {
      alert("Please select a problem before submitting.");
      return;
    }
    const prob = filteredProblems[selectedIndex];
    const langMap = { py: "py", python: "py", java: "java", cpp: "cpp", "c++": "cpp" };
    const lang = langMap[language.toLowerCase()] || "py";

    try {
      const response = await submitCode(lang, code, prob.id, userId, userContestId, userName, input);
      setOutput(response.output || response.error || "Unknown error");
    } catch (error) {
      setOutput("Submission failed.");
      console.error(error);
    }
  };

  // Run handler
  const handleRun = async () => {
    if (selectedIndex === null) {
      alert("Please select a problem before running.");
      return;
    }
    const langMap = { py: "py", python: "py", java: "java", cpp: "cpp", "c++": "cpp" };
    const lang = langMap[language.toLowerCase()] || "py";
    try {
      const response = await runCode(lang, code, input);
      setOutput(response.output || response.error || "Unknown error");
    } catch (error) {
      setOutput("Run failed." + (error.message || error.toString()));
      console.error(error);
    }
  };

  // AI Hint handler
  async function handleGenerateAIHint() {
    if (selectedIndex === null) return;
    const prob = filteredProblems[selectedIndex];
    setAiLoading(true);
    setAiHint("");
    try {
      const hint = await generateAIHint(prob.description || "", prob.codeBase || "");
      setAiHint(hint);
    } catch (e) {
      setAiHint("Failed to generate hint.");
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  }

  if (showLeaderboard) {
    return (
      <LeaderboardPage contestId={userContestId || ""} contests={contests} />
    );
  }
  if (showContestRegister) {
    return (
      <ContestRegisterPage />
    );
  }
  if (showSubmissions) {
    return (
      <SubmissionsPage
        userId={userId}
        problems={problems}
        onBack={() => setSubmissions(false)}
      />
    );
  }


  // *** NEW UI STYLING (only a layout change, feature parity remains) ***
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1e202f] to-[#2c2d40] text-white font-sans">
      {/* Left Pane */}
      <div className="w-1/2 flex flex-col p-6 overflow-y-auto space-y-6">

        <HeaderControls
          language={language}
          setLanguage={setLanguage}
          code={filteredProblems[selectedIndex]?.codeBase || ""}
          problems={filteredProblems}
          selectedIndex={selectedIndex}
          setShowLeaderboard={setShowLeaderboard}
          setShowContestRegister={setShowContestRegister}
        />

        <ProblemSelector
          problems={filteredProblems}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setCode={setCode}
          setInput={setInput}
          setOutput={setOutput}
          setSimilarityScore={setSimilarityScore}
          setIsSubmitDisabled={setIsSubmitDisabled}
          setLanguage={setLanguage}
        />

        {selectedIndex !== null && filteredProblems[selectedIndex] ? (
          <div className="mt-6">
            {/* ProblemDetails spans full width */}
            <ProblemDetails problem={filteredProblems[selectedIndex]} />
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-10 select-none">
            Please select a problem to see details
          </p>
        )}

        {/* Group smaller controls in a horizontal flex container */}
        {aiEnabled && selectedIndex !== null && (
          <div className="flex items-center space-x-3 mb-4 max-w-md">
            <button
              onClick={handleGenerateAIHint}
              disabled={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-1.5 text-sm inline-flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Get minimal AI hint"
            >
              {aiLoading ? "Generating hint..." : "💡 Get hint"}
            </button>
            {/* Optional: if hint shown, place it below this container to keep layout clean */}
          </div>
        )}

        {/* Output Console: make it expand and wide */}
        <div className="mb-6 max-w-full max-h-64 overflow-auto rounded bg-zinc-900 p-4 text-sm font-mono text-white">
          <OutputConsole output={output} />
        </div>

        {/* Horizontal container for InputBox and Submissions button */}
        <div className="flex items-center space-x-4">
          <InputBox input={input} setInput={setInput} className="flex-1 max-w-xs" />

          <button
            onClick={() => setSubmissions(true)}
            className="px-4 h-10 bg-green-600 rounded text-white hover:bg-green-700 text-sm min-w-[100px]"
          >
            Submissions
          </button>
        </div>

        {/* AI hint text preview placed below the button and other inputs */}
        {aiEnabled && selectedIndex !== null && aiHint && (
          <pre className="bg-zinc-800 rounded p-3 max-h-48 overflow-auto whitespace-pre-wrap text-sm mt-2 max-w-md">
            {aiHint}
          </pre>
        )}

      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col p-6 h-full">
        <EditorPanel
          code={code}
          setCode={setCode}
          language={language}
          similarityScore={similarityScore}
          isSubmitDisabled={isSubmitDisabled}
          runHandler={handleRun}
          submitHandler={handleSubmit}
        />
      </div>
    </div>
  );
}
