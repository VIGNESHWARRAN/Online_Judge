import React, { useEffect, useState } from "react";
import { readSubmissions } from "../api/submissions";
import { calculateLeaderboardByContest, LeaderboardEntry } from "../api/leaderboard";

interface LeaderboardPageProps {
  contestProblemIds: string[]; // Array of problem IDs belonging to the contest
}

export default function LeaderboardPage({ contestProblemIds }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const submissions = await readSubmissions();
        if (submissions) {
          const leaderboardData = calculateLeaderboardByContest(submissions, contestProblemIds);
          setLeaderboard(leaderboardData);
        } else {
          setLeaderboard([]);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }

    if (contestProblemIds && contestProblemIds.length > 0) {
      loadLeaderboard();
    } else {
      // If no contest problems provided, clear leaderboard
      setLeaderboard([]);
      setLoading(false);
    }
  }, [contestProblemIds]);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (loading) {
    return (
      <div className="text-center text-indigo-400 mt-10">
        Loading leaderboard...
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6">🏆 Leaderboard</h2>
        <p className="text-gray-400">No submissions or no problems for this contest yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-indigo-400 text-center mb-6">
        🏆 Leaderboard
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-indigo-700 rounded-lg">
          <thead className="bg-indigo-800 text-indigo-100">
            <tr>
              <th className="px-4 py-2 border border-indigo-700">Rank</th>
              <th className="px-4 py-2 border border-indigo-700">Username</th>
              <th className="px-4 py-2 border border-indigo-700">Score</th>
              <th className="px-4 py-2 border border-indigo-700">Avg Time Percentile</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-indigo-100">
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.user}
                className="text-center hover:bg-indigo-800/40 transition duration-200"
              >
                <td className="border border-indigo-700 px-4 py-2">{getMedal(index + 1)}</td>
                <td className="border border-indigo-700 px-4 py-2">{entry.username}</td>
                <td className="border border-indigo-700 px-4 py-2">{entry.totalScore}</td>
                <td className="border border-indigo-700 px-4 py-2">{entry.avgTimePercentile.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
