export default function CodeEditorPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2a2a3d] text-white font-sans">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col p-4 relative">
        <div className="flex justify-between mb-4">
          <select id="questionSelector" className="px-4 py-2 rounded bg-gray-700 text-white text-sm">
            <option value="question">Questions</option>
            <option value="question1">Question 1: 3 points</option>
            <option value="question2">Question 2: 7 points</option>
            <option value="question3">Question 3: 6 points</option>
            <option value="question4">Question 4: 6 points</option>
            <option value="question5">Question 5: 8 points</option>
            <option value="question6">Question 6: 3 points</option>
            <option value="question7">Question 7: 8 points</option>
            <option value="question8">Question 8: 6 points</option>
            <option value="question9">Question 9: 6 points</option>
            <option value="question10">Question 10: 7 points</option>
            <option value="question11">Question 11: 10 points</option>
          </select>

          <select id="languageSelector" className="px-4 py-2 rounded bg-gray-700 text-white text-sm">
            <option value="python3">Python</option>
            <option value="java">Java</option>
          </select>

          <button id="copyButton" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white text-sm">
            Copy Code
          </button>
        </div>

        <div id="questionBox" className="flex-1 bg-[#29293d] p-4 rounded-lg overflow-y-auto shadow mb-4">
          <pre id="questionText" className="bg-[#2a2a3d] p-2 rounded whitespace-pre-wrap mb-2" />
          <pre id="codeDisplay" className="bg-[#1a1a26] p-2 rounded whitespace-pre-wrap" />
        </div>

        <div id="outputBox" className="bg-[#1a1a26] text-gray-200 p-4 rounded-lg shadow mb-4">
          <strong>Output will be displayed here.</strong>
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

      <button
        id="submissionPageButton"
        className="absolute left-[38%] top-[77%] px-5 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white text-base"
        onClick={() => window.open('submission_details.html', '_blank')}
      >
        View Submissions
      </button>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button id="runButton" className="px-4 py-2 bg-blue-600 hover:bg-blue-800 rounded text-white">
              Run
            </button>
            <button id="submitButton" className="px-4 py-2 bg-blue-600 hover:bg-blue-800 rounded text-white">
              Submit
            </button>
          </div>
          <p id="similarity_score" className="text-sm ml-4">
            Code Diff: 0%
          </p>
        </div>

        <div className="flex-1 min-h-[300px] flex flex-col">
          <div id="editor" className="flex-1 h-full border rounded bg-[#1a1a26]" />
        </div>
      </div>
    </div>
  );
}
