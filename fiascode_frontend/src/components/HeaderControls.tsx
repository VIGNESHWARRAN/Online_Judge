

export default function HeaderControls({
  language,
  setLanguage,
  code,
  setShowLeaderboard,
  setShowContestRegister,
}) {
  return (
    <div className="flex items-center space-x-4">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-36 px-4 h-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="py">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      <button
        onClick={() => {
          navigator.clipboard.writeText(code).then(() => {
            alert("Code copied to clipboard!");
          }).catch(() => {
            alert("Failed to copy code.");
          });
        }}
        className="px-4 h-10 rounded bg-green-600 hover:bg-green-800 text-white"
      >
        Copy Code
      </button>

      <button
        onClick={() => setShowContestRegister(true)}
        className="px-4 h-10 bg-teal-600 rounded text-white hover:bg-teal-700"
      >
        Register for Contests
      </button>

      <button
        onClick={() => setShowLeaderboard(true)}
        className="px-4 h-10 bg-green-600 rounded text-white hover:bg-green-700"
      >
        Leaderboard
      </button>
    </div>
  );
}
