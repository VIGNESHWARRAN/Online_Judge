const CONTEST_API_BASE = "http://localhost:5174/api/contests";

// Create a new contest
export function addContest(contestData) {
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
    });
}

// Get all contests
export function readContests() {
  return fetch(CONTEST_API_BASE, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch contests");
      return res.json();
    })
    .catch((err) => {
      console.error("Error fetching contests:", err);
    });
}

// Get a single contest by ID
export function readContest(contestId) {
    console.log(readContest);
  return fetch(`${CONTEST_API_BASE}/${contestId}`, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("Contest not found");
      return res.json();
    })
    .catch((err) => {
      console.error("Error reading contest:", err);
    });
}

// Update a contest by ID
export function updateContest(contestId, updatedData) {
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
    });
}

// Delete a contest by ID
export function deleteContest(contestId) {
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
    });
}

// Register user for a contest
export function registerUser(contestId, userId) {
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
    });
}

// Unregister user from a contest (optional)
export function unregisterUserFromContest(contestId, userId) {
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
    });
}
