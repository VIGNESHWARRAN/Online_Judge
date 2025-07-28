import React from "react";
import Editor from "@monaco-editor/react";

export default function EditorPanel({
  code,
  setCode,
  language,
  similarityScore,
  isSubmitDisabled,
  runHandler,
  submitHandler,
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex space-x-4 items-center">
        <button
          disabled={isSubmitDisabled}
          onClick={runHandler}
          className={`flex-1 rounded py-3 font-semibold text-white transition duration-200 ${
            isSubmitDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={isSubmitDisabled ? "Disabled due to low similarity" : ""}
        >
          Run
        </button>

        <button
          disabled={isSubmitDisabled}
          onClick={submitHandler}
          className={`flex-1 rounded py-3 font-semibold text-white transition duration-200 ${
            isSubmitDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          title={isSubmitDisabled ? "Disabled due to low similarity" : ""}
        >
          Submit
        </button>

        <div className="text-white font-mono">{similarityScore}%</div>
      </div>

      {/* Editor takes full remaining space */}
      <div className="flex-1">
        <Editor
          height="100%"
          width="100%"
          language={language === "py" ? "python" : language}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            fontSize: 16,
            fontFamily: "'Fira Mono', monospace",
            minimap: { enabled: false },
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}
