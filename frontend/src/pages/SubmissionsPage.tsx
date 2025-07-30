import React, { useEffect, useState } from "react";
import { readSubmissions } from "../api/submissions"; // Adjust this path as needed

interface Submission {
  submissionId: string;
  problem: string;        // problem id (to match with title etc)
  user: string;
  username: string;
  contestId?: string | null;
  score: number;
  result: 'Accepted' | 'Wrong Answer' | 'Pending' | 'Judging';
  time?: number;
  memory?: number;
  submittedAt: string;    // ISO timestamp, from Mongoose schema
}

interface UserSubmissionsPageProps {
  userId: string;
  problems: Array<{ id: string; title: string }>; // List of all problems
  onBack?: () => void;                            // Optional back handler
}

export default function SubmissionsPage({ userId, problems, onBack }: UserSubmissionsPageProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick lookup from problemId to title
  const problemName = (problemId: string) =>
    problems.find((p) => p.id === problemId)?.title || problemId;

  useEffect(() => {
    setLoading(true);
    readSubmissions()
      .then((allSubs: Submission[]) => {
        // Only submissions for this user
        const userSubs = (allSubs || []).filter(sub => sub.user === userId);
        // Sort with latest first
        userSubs.sort(
          (a, b) =>
            new Date(b.submittedAt || 0).getTime() -
            new Date(a.submittedAt || 0).getTime()
        );
        setSubmissions(userSubs);
      })
      .catch(err => {
        setSubmissions([]);
        console.error("Failed to load user submissions:", err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-400 text-lg font-semibold">
        Loading submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">Submissions</h2>
        <p className="text-gray-400">No submissions yet.</p>
        {onBack && (
          <button onClick={onBack} className="mt-8 px-4 py-2 bg-blue-600 rounded hover:bg-blue-800 font-semibold">
            ← Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white flex flex-col">
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white font-semibold"
          >
            ← Back
          </button>
        )}
        <h2 className="text-3xl font-bold text-indigo-400 mx-auto">Your Submissions</h2>
        <div style={{width: 120}} />
      </div>

      <div className="overflow-x-auto shadow rounded border border-indigo-700">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-indigo-800 text-indigo-100">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Problem</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Result</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-indigo-100">
            {submissions.map(sub => (
              <tr key={sub.submissionId}>
                <td className="px-4 py-2 whitespace-nowrap">
                  {sub.submittedAt
                    ? new Date(sub.submittedAt).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-2">{problemName(sub.problem)}</td>
                <td className="px-4 py-2">{sub.score}</td>
                <td className="px-4 py-2">{sub.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
