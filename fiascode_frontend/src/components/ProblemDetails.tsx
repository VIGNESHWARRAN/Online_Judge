

export default function ProblemDetails({ problem }) {
  if (!problem) {
    return (
      <p className="text-center text-gray-400 select-none mt-20">
        Select a problem to see details
      </p>
    );
  }

  return (
    <section className="bg-gray-800 p-6 rounded-lg shadow-lg overflow-auto max-h-96">
      <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
      <p className="mb-6 whitespace-pre-wrap">{problem.description}</p>

      <h3 className="font-semibold mb-2 text-lg border-b border-gray-700 pb-1">
        Constraints
      </h3>
      <p className="mb-6">{problem.constraintLimit + '%'}</p>

      {problem.testcases.length > 1 && (
        <>
          <h3 className="font-semibold mb-2 text-lg border-b border-gray-700 pb-1">
            Test Cases
          </h3>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto space-y-3 text-sm">
            {problem.testcases.slice(0, 2).map((tc, i) => (
              <li key={i} className="bg-gray-700 p-3 rounded shadow-sm">
                <p>
                  <strong>Input:</strong> {tc.input}
                </p>
                <p>
                  <strong>Output:</strong> {tc.output}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
