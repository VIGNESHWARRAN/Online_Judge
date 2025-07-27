export interface Submission {
  user: string;
  username: string;
  problem: string;
  result: string; // "Accepted" or others
  score: number;
  submittedAt: string; // ISO string
}

export interface LeaderboardEntry {
  user: string;
  username: string;
  totalScore: number;
  avgTimePercentile: number; // 0 to 100, higher is better
}

/**
 * Calculate leaderboard entries filtered by contest problems.
 * @param submissions All submissions (across contests)
 * @param contestProblemIds Problem IDs belonging to the contest
 * @returns Sorted leaderboard entries for the contest
 */
export function calculateLeaderboardByContest(
  submissions: Submission[],
  contestProblemIds: string[]
): LeaderboardEntry[] {
  // Filter submissions to only those related to the contest's problems
  const filteredSubs = submissions.filter(sub => contestProblemIds.includes(sub.problem));

  const userProblemMap: Record<string, Record<string, Submission>> = {};
  const problemSubmissionsMap: Record<string, Submission[]> = {};

  // Step 1: Keep only the earliest accepted submission per user & problem
  for (const sub of filteredSubs) {
    if (sub.result !== "Accepted") continue;

    const { user, problem } = sub;

    if (!userProblemMap[user]) userProblemMap[user] = {};
    const existing = userProblemMap[user][problem];

    if (!existing || new Date(sub.submittedAt) < new Date(existing.submittedAt)) {
      userProblemMap[user][problem] = sub;
    }
  }

  // Step 2: Aggregate problem-wise accepted submissions
  for (const user in userProblemMap) {
    for (const problem in userProblemMap[user]) {
      const sub = userProblemMap[user][problem];
      if (!problemSubmissionsMap[problem]) problemSubmissionsMap[problem] = [];
      problemSubmissionsMap[problem].push(sub);
    }
  }

  // Step 3: Compute time percentile ranks per problem
  const problemTimePercentiles: Record<string, Record<string, number>> = {};

  for (const problem in problemSubmissionsMap) {
    const subs = problemSubmissionsMap[problem];
    const times = subs.map(s => new Date(s.submittedAt).getTime());
    const sortedTimes = [...times].sort((a, b) => a - b);

    problemTimePercentiles[problem] = {};

    for (const sub of subs) {
      const t = new Date(sub.submittedAt).getTime();
      let percentile = 0;

      if (sortedTimes.length === 1) {
        percentile = 100;
      } else {
        const rank = sortedTimes.findIndex(x => x >= t);
        percentile = ((sortedTimes.length - rank - 1) / (sortedTimes.length - 1)) * 100;
      }

      problemTimePercentiles[problem][sub.user] = parseFloat(percentile.toFixed(2));
    }
  }

  // Step 4: Aggregate user leaderboard entries
  const leaderboard: LeaderboardEntry[] = [];

  for (const user in userProblemMap) {
    const problems = userProblemMap[user];
    const correctSubs = Object.values(problems);
    const totalScore = correctSubs.reduce((acc, sub) => acc + sub.score, 0);
    const username = correctSubs[0]?.username || "Unknown";

    const percentiles = correctSubs.map(sub => {
      return problemTimePercentiles[sub.problem]?.[user] ?? 0;
    });

    const avgTimePercentile = percentiles.length
      ? percentiles.reduce((a, b) => a + b, 0) / percentiles.length
      : 0;

    leaderboard.push({
      user,
      username,
      totalScore,
      avgTimePercentile: parseFloat(avgTimePercentile.toFixed(2)),
    });
  }

  // Step 5: Sort leaderboard by total score desc, then time percentile desc
  leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.avgTimePercentile - a.avgTimePercentile;
  });

  return leaderboard;
}
