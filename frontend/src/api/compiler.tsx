
const COMPILER_API_BASE = `${import.meta.env.VITE_BACKEND_IP}/api/compiler`;

// Submit code for evaluation (submission)
export async function submitCode( lang, code, problemId, userId, contestId, userName, input = "" ) {
  console.log(lang, code, problemId, userId, contestId, userName, input);
  const res = await fetch(`${COMPILER_API_BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ lang, code, problemId, userId, contestId, userName, input }),
  });
  if (!res.ok) throw new Error("Since I was using the instance on AWS to run and submit, I switched it off after the contest so please bare with my credits😅");
  const data = await res.json();
  return data;
}

// Run code without submission (for instant feedback or code execution)
export async function runCode( lang, code, input = "" ) {
  const res = await fetch(`${COMPILER_API_BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ lang, code, input }),
  });
  if (!res.ok) throw new Error("Since I was using the instance on AWS to run and submit, I switched it off after the contest so please bare with my credits😅");
  const data = await res.json();
  return data;
}
