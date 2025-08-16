import React, { useState } from "react";

export default function HeaderControls({
  language,
  setLanguage,
  code,
  setCode,
  fiascode,
  setShowLeaderboard,
  setShowContestRegister,
  setSidebarOpen,
}) {
  const [clickedButton, setClickedButton] = useState(null);

  const handleClickWithFeedback = (buttonKey, callback) => {
    setClickedButton(buttonKey);
    if (callback) callback();
    setTimeout(() => setClickedButton(null), 500);
  };

  const getButtonClass = (key, baseClasses) => {
    return `${baseClasses} ${clickedButton === key ? "bg-yellow-500" : ""}`;
  };

  const languageBoilerplates = {
    py: "# Write your Python code here\n",
    java: `public class Main {\n  public static void main(String[] args) {\n    // Write your Java code here\n  }\n}\n`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Write your C++ code here\n  return 0;\n}\n`,
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    handleClickWithFeedback("language", () => {
      setLanguage(newLang);

      // If fiascode is false, replace code with boilerplate on language change
      if (fiascode === false) {
        setCode(languageBoilerplates[newLang] || "");
      }
    });
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Problems toggle button */}
      <button
        onClick={() =>
          handleClickWithFeedback("problems", () => setSidebarOpen((prev) => !prev))
        }
        className="cursor-pointer px-4 h-10 bg-indigo-700 rounded text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Toggle Problem List"
      >
        Problems
      </button>

      {/* Language selector */}
      <select
        value={language}
        onChange={handleLanguageChange}
        className="cursor-pointer w-36 px-4 h-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        aria-label="Select language"
      >
        <option value="py">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      {/* Copy code button */}
      {fiascode !== false && (
        <button
          onClick={() =>
            handleClickWithFeedback("copyCode", () => {
              navigator.clipboard.writeText(code);
            })
          }
          className="cursor-pointer px-4 h-10 rounded bg-green-600 hover:bg-green-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Copy Code
        </button>
      )}

      {/* Register for Contests button */}
      <button
        onClick={() =>
          handleClickWithFeedback("register", () => setShowContestRegister(true))
        }
        className="cursor-pointer px-4 h-10 bg-teal-600 rounded text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        Register for Contests
      </button>

      {/* Leaderboard button */}
      <button
        onClick={() =>
          handleClickWithFeedback("leaderboard", () => setShowLeaderboard(true))
        }
        className="cursor-pointer px-4 h-10 bg-green-600 rounded text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Leaderboard
      </button>
    </div>
  );
}
