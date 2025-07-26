import React, { useEffect, useState } from 'react';
import { readSubmissions } from '../api/submissions'; 
import { readUsers } from '../api/users';// adjust path accordingly
import { readProblems } from '../api/problems';
function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [submissions, users, problems] = await Promise.all([
          readSubmissions(),
          readUsers(),
          readProblems(),
        ]);

        // Map users and problems by ID for quick lookup
        const userMap = new Map(users.map(u => [u.id || u._id, u.name || 'Unknown User']));
        const problemMap = new Map(problems.map(p => [p.id || p._id, p.score || 0]));

        // Filter accepted submissions
        const acceptedSubs = submissions.filter(
          (sub) => sub.result && sub.result.toLowerCase() === 'accepted'
        );

        // Aggregate per user
        const userStats = {};

        acceptedSubs.forEach(sub => {
          const userId = sub.user;
          const problemId = sub.problem;

          if (!userId || !problemId) return;

          if (!userStats[userId]) {
            userStats[userId] = {
              userId,
              userName: userMap.get(userId) || userId,
              problemsSolved: new Set(),
              totalComputeTime: 0,
              totalScore: 0,
            };
          }

          if (!userStats[userId].problemsSolved.has(problemId)) {
            userStats[userId].problemsSolved.add(problemId);
            const score = problemMap.get(problemId) || 0;
            userStats[userId].totalScore += score;
          }

          userStats[userId].totalComputeTime += sub.time || 0;
        });

        // Convert to array for sorting and rendering
        const leaderboardArr = Object.values(userStats).map(user => ({
          userId: user.userId,
          userName: user.userName,
          problemsSolved: user.problemsSolved.size,
          totalComputeTime: user.totalComputeTime,
          totalScore: user.totalScore,
        }));

        // Sort by problems solved desc, total solve time asc, total score desc
        leaderboardArr.sort((a, b) => {
          if (b.problemsSolved !== a.problemsSolved) {
            return b.problemsSolved - a.problemsSolved;
          }
          if (a.totalComputeTime !== b.totalComputeTime) {
            return a.totalComputeTime - b.totalComputeTime;
          }
          return b.totalScore - a.totalScore;
        });

        setLeaderboard(leaderboardArr);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  if (loading) return <div className="text-center text-white p-4">Loading leaderboard...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e1e2f, #2a2a3d)',
        color: '#f0f0f0',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
        minHeight: '80vh',
        maxWidth: '960px',
        margin: 'auto',
        borderRadius: 12,
        boxShadow: '0 0 12px #111',
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 20, borderBottom: '2px solid #444', paddingBottom: 8 }}>
        Leaderboard
      </h1>
      {leaderboard.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No accepted submissions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#2d2d44' }}>
              <th style={thStyle}>Rank</th>
              <th style={thStyle}>User Name</th>
              <th style={thStyle}>Problems Solved</th>
              <th style={thStyle}>Total Solve Time (s)</th>
              <th style={thStyle}>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, idx) => (
              <tr
                key={user.userId}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#29293d' : '#232334',
                  textAlign: 'left',
                }}
              >
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{user.userName}</td>
                <td style={tdStyle}>{user.problemsSolved}</td>
                <td style={tdStyle}>{user.totalComputeTime.toFixed(2)}</td>
                <td style={tdStyle}>{user.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: '12px 16px',
  fontWeight: 'bold',
  fontSize: '14px',
  borderBottom: '1px solid #444',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px',
};

export default Leaderboard;
