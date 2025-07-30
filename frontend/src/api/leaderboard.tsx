// leaderboard.ts

export interface Submission {
  user: string;
  username: string;
  problem: string;
  result: string; // "Accepted" or others
  score: number;
  submittedAt: string; // ISO string
  contestId?: string; // optionally present in submissions
}

export interface LeaderboardEntry {
  user: string;
  username: string;
  totalScore: number;
  avgTimePercentile: number; // 0 to 100, higher is better
}

export interface Contest {
  id: string;
  problems: string[];
}

export function calculateLeaderboard(
  submissions: Submission[],
  contestProblemIds: string[]
): LeaderboardEntry[] {
  // Filter submissions to those for problems in contest
  const filteredSubs = submissions.filter((sub) =>
    contestProblemIds.includes(sub.problem)
  );

  // Map: user -> problem -> earliest accepted submission
  const userProblemMap: Record<string, Record<string, Submission>> = {};
  // Map: problem -> list of accepted submissions for percentile calculation
  const problemSubmissionsMap: Record<string, Submission[]> = {};

  // Track earliest accepted submission for each user & problem
  for (const sub of filteredSubs) {
    if (sub.result !== "Accepted") continue;

    if (!userProblemMap[sub.user]) userProblemMap[sub.user] = {};
    const existingSub = userProblemMap[sub.user][sub.problem];

    if (!existingSub || new Date(sub.submittedAt) < new Date(existingSub.submittedAt)) {
      userProblemMap[sub.user][sub.problem] = sub;
    }
  }

  // Aggregate accepted submissions per problem
  for (const user in userProblemMap) {
    for (const problem in userProblemMap[user]) {
      const sub = userProblemMap[user][problem];
      if (!problemSubmissionsMap[problem]) problemSubmissionsMap[problem] = [];
      problemSubmissionsMap[problem].push(sub);
    }
  }

  // Calculate time percentile ranks per problem
  const problemTimePercentiles: Record<string, Record<string, number>> = {};
  for (const problem in problemSubmissionsMap) {
    const subs = problemSubmissionsMap[problem];
    const sortedTimes = subs
      .map((s) => new Date(s.submittedAt).getTime())
      .sort((a, b) => a - b);
    problemTimePercentiles[problem] = {};

    for (const sub of subs) {
      const t = new Date(sub.submittedAt).getTime();
      let percentile = 0;

      if (sortedTimes.length === 1) {
        percentile = 100;
      } else {
        const rank = sortedTimes.findIndex((time) => time >= t);
        percentile = ((sortedTimes.length - rank - 1) / (sortedTimes.length - 1)) * 100;
      }

      // Store percentile rounded to 2 decimals
      problemTimePercentiles[problem][sub.user] = parseFloat(percentile.toFixed(2));
    }
  }

  // Build leaderboard entries per user
  const leaderboard: LeaderboardEntry[] = [];

  for (const user in userProblemMap) {
    const solvedSubs = Object.values(userProblemMap[user]);
    const totalScore = solvedSubs.reduce((acc, sub) => acc + (sub.score || 0), 0);
    const username = solvedSubs[0]?.username || "Unknown";

    const avgTimePercentile =
      solvedSubs.length === 0
        ? 0
        : parseFloat(
            (
              solvedSubs.reduce(
                (acc, sub) => acc + (problemTimePercentiles[sub.problem]?.[user] ?? 0),
                0
              ) / solvedSubs.length
            ).toFixed(2)
          );

    leaderboard.push({
      user,
      username,
      totalScore,
      avgTimePercentile,
    });
  }

  // Sort leaderboard by totalScore descending, then avgTimePercentile descending
  leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.avgTimePercentile - a.avgTimePercentile;
  });

  return leaderboard;
}

export function calculateLeaderboards(
  submissions: Submission[],
  contests: Contest[]
): Record<string, LeaderboardEntry[]> {
  const leaderboards: Record<string, LeaderboardEntry[]> = {};

  for (const contest of contests) {
    // Defensive - ensure problems array present
    if (!Array.isArray(contest.problems)) {
      leaderboards[contest.id] = [];
      continue;
    }
    leaderboards[contest.id] = calculateLeaderboard(submissions, contest.problems);
  }

  return leaderboards;
}

export function filterSubmissionsByContestId(
  submissions: Submission[],
  contestId: string
): Submission[] {
  return submissions.filter((sub) => sub.contestId === contestId);
}
