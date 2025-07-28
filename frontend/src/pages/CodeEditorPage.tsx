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
import { submit, run } from "../api/compiler";

function diceCoefficient(str1: string, str2: string): number {
  if (!str1.length || !str2.length) return 0;

  // Helper: Get bigram frequency map from string
  const bigrams = (s: string): Map<string, number> => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2).toLowerCase();
      map.set(bg, (map.get(bg) ?? 0) + 1);
    }
    return map;
  };

  // Sum of all counts in a map (total number of bigrams including duplicates)
  const sumValues = (map: Map<string, number>): number => {
    let sum = 0;
    for (const count of map.values()) {
      sum += count;
    }
    return sum;
  };

  const map1 = bigrams(str1);
  const map2 = bigrams(str2);

  let intersection = 0;

  for (const [bg, count] of map1.entries()) {
    if (map2.has(bg)) {
      intersection += Math.min(count, map2.get(bg)!);
    }
  }

  const totalBigramCount = sumValues(map1) + sumValues(map2);

  // Handle edge case if totalBigramCount is zero
  if (totalBigramCount === 0) return 0;

  return (2 * intersection) / totalBigramCount;
}

export default function CodeEditor() {
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

  const [codeInitialized, setCodeInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    async function fetchAllData() {
      try {
        const [userData, allProblems, allContests] = await Promise.all([
          readUser(userId),
          readProblems(),
          readContests(),
        ]);
        setUserContestId(userData?.contest || null);

        const normalizedContests = (allContests || []).map((c) => ({
          ...c,
          problems: c.problems || [],
          id: c.id || c._id,
        }));

        setContests(normalizedContests);
        setProblems(allProblems);
        setCodeInitialized(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchAllData();
  }, [userId]);

  const currentContest = contests.find((c) => c.id === userContestId);
  const allContestProblemIds = new Set<string>(contests.flatMap((c) => c.problems || []));

  // Check if contest is live (current time is within contest start and end)
  const isContestLive =
    currentContest && currentContest.start && currentContest.end
      ? (() => {
          const now = new Date();
          const start = new Date(currentContest.start);
          const end = new Date(currentContest.end);
          return now >= start && now <= end;
        })()
      : false;

  // Filter problems depending on contest live status
  const filteredProblems =
    userContestId && isContestLive
      ? problems.filter((p) => currentContest?.problems.includes(p.id))
      : problems.filter((p) => !allContestProblemIds.has(p.id));

  useEffect(() => {
    if (filteredProblems.length === 0) {
      setSelectedIndex(null);
      setCode("");
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      setInput("");
      setOutput("");
      setCodeInitialized(true);
    } else if (!codeInitialized) {
      setSelectedIndex(0);
      setCode(filteredProblems[0].codeBase || "");
      setSimilarityScore(100);
      setIsSubmitDisabled(false);
      setLanguage("py");
      setInput("");
      setOutput("");
      setCodeInitialized(true);
    }
  }, [filteredProblems, codeInitialized]);

  useEffect(() => {
    if (selectedIndex === null || !filteredProblems[selectedIndex]) {
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      return;
    }
    const prob = filteredProblems[selectedIndex];
    const similarity = diceCoefficient(prob.codeBase || "", code);
    const scorePercent = Math.round(similarity * 100);

    setSimilarityScore(scorePercent);
    setIsSubmitDisabled(scorePercent < (prob.constraintLimit || 0));
  }, [code, selectedIndex, filteredProblems]);

  const handleSubmit = async () => {
    if (selectedIndex === null) {
      alert("Please select a problem before submitting.");
      return;
    }

    const prob = filteredProblems[selectedIndex];
    const langMap = { py: "py", python: "py", java: "java", cpp: "cpp", "c++": "cpp" };
    const lang = langMap[language.toLowerCase()] || "py";

    try {
      const response = await submit(lang, code, prob.id, userId, userContestId, userName, input);
      setOutput(response.output || response.error || "Unknown error");
    } catch (error) {
      setOutput("Submission failed.");
      console.error(error);
    }
  };

  const handleRun = async () => {
    if (selectedIndex === null) {
      alert("Please select a problem before running.");
      return;
    }

    const langMap = { py: "py", python: "py", java: "java", cpp: "cpp", "c++": "cpp" };
    const lang = langMap[language.toLowerCase()] || "py";

    try {
      const response = await run(lang, code, input);
      setOutput(response.output || response.error || "Unknown error");
    } catch (error) {
      setOutput("Run failed.");
      console.error(error);
    }
  };

  if (showLeaderboard) {
    return (
      <>
        <LeaderboardPage contestId={userContestId || ""} contests={contests} />
      </>
    );
  }

  if (showContestRegister) {
    return (
      <>
        <ContestRegisterPage />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1e202f] to-[#2c2d40] text-white font-sans">
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

        {/* Added margin top spacing below ProblemSelector */}
        {selectedIndex !== null && filteredProblems[selectedIndex] ? (
          <div className="mt-6">
            <ProblemDetails problem={filteredProblems[selectedIndex]} />
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-10 select-none">
            Please select a problem to see details
          </p>
        )}

        <OutputConsole output={output} />

        <InputBox input={input} setInput={setInput} />
      </div>

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
