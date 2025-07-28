import React from "react";

export default function ProblemSelector({
  problems,
  selectedIndex,
  setSelectedIndex,
  setCode,
  setInput,
  setOutput,
  setSimilarityScore,
  setIsSubmitDisabled,
  setLanguage,
}) {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setSelectedIndex(null);
      setCode("");
      setInput("");
      setOutput("");
      setSimilarityScore(0);
      setIsSubmitDisabled(true);
      return;
    }
    const index = Number(val);
    setSelectedIndex(index);
    const selProb = problems[index];
    setCode(selProb.codeBase || "");
    setInput("");
    setOutput("");
    setSimilarityScore(100);
    setIsSubmitDisabled(false);
    setLanguage("py"); // or determine from problem if info available
  };

  return (
    <select
      value={selectedIndex ?? ""}
      onChange={handleChange}
      className="px-4 py-2 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      <option value="">Select a Problem</option>
      {problems.map((p, idx) => (
        <option key={p.id} value={idx}>
          {p.title} — {p.score} pts
        </option>
      ))}
    </select>
  );
}
