
const CONTEST_API_BASE = `http://${process.env.BACKEND_IP}/api/contests`;
interface TestCase {
  input: string;
  output: string;
}

interface Contest {
  id: string;                      // Unique contest identifier
  title: string;
  description: string;
  score: number;                   // Total score or points for the contest
  codeBase: string;                // Code base or related info (e.g., starter code)
  testcases: TestCase[];           // Array of test cases
  constraintLimit: number;         // Some numeric constraint (e.g., timeout limit)
  problems: string[];              // List of problem IDs associated with the contest
  start?: Date | string | null;   // Optional start date/time
  end?: Date | string | null;     // Optional end date/time
}

export function addContest(contestData: Omit<Contest, 'id'>): Promise<Contest>{
  return fetch(CONTEST_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(contestData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to add contest");
      return res.json();
    })
    .catch((err) => {
      console.error("Error adding contest:", err);
      throw err;
    });
}

export function readContests() {
  return fetch(CONTEST_API_BASE, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch contests");
      return res.json();
    })
    .catch((err) => {
      console.error("Error fetching contests:", err);
      throw err;
    });
}

export function readContest(contestId:string) {
  return fetch(`${CONTEST_API_BASE}/${contestId}`, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("Contest not found");
      return res.json();
    })
    .catch((err) => {
      console.error("Error reading contest:", err);
      throw err;
    });
}

export function updateContest(contestId:string, updatedData: Omit<Contest, 'id'>) {
  return fetch(`${CONTEST_API_BASE}/${contestId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updatedData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update contest");
      return res.json();
    })
    .catch((err) => {
      console.error("Error updating contest:", err);
      throw err;
    });
}

export function deleteContest(contestId:string) {
  return fetch(`${CONTEST_API_BASE}/${contestId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete contest");
      return res.json();
    })
    .catch((err) => {
      console.error("Error deleting contest:", err);
      throw err;
    });
}

export function registerUser(contestId:string, userId:string) {
  return fetch(`${CONTEST_API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ contestId, userId }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to register user for contest");
      return res.json();
    })
    .catch((err) => {
      console.error("Error registering user for contest:", err);
      throw err;
    });
}

export function unregisterUserFromContest(contestId:string, userId:string) {
  return fetch(`${CONTEST_API_BASE}/unregister`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ contestId, userId }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to unregister user from contest");
      return res.json();
    })
    .catch((err) => {
      console.error("Error unregistering user from contest:", err);
      throw err;
    });
}

export async function addProblemToContest(contestId:string, problemId:string) {
  try {
    const contestRes = await fetch(`${CONTEST_API_BASE}/${contestId}`, { credentials: "include" });
    if (!contestRes.ok) throw new Error("Contest not found");

    const contest = await contestRes.json();
    const problems = contest.problems || [];

    if (!problems.includes(problemId)) {
      problems.push(problemId);
    }

    const updatedContest = { ...contest, problems };

    const updateRes = await fetch(`${CONTEST_API_BASE}/${contestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updatedContest),
    });

    if (!updateRes.ok) throw new Error("Failed to update contest with new problem");

    return await updateRes.json();
  } catch (err) {
    console.error("Error adding problem to contest:", err);
    throw err;
  }
}
