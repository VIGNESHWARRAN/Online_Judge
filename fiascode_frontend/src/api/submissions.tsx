const API_BASE = `http://${process.env.BACKEND_IP}/api/submissions`;

// Define interface for a Submission (customize fields as per your backend)
export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  contestId?: string;            // Optional if submissions can be outside contests
  code: string;
  language: string;
  status: string;                // e.g., "Pending", "Accepted", "Rejected"
  result: string;                // e.g., output or error message
  score: number;
  submittedAt: string;           // ISO date string
  // Add additional fields if needed
}

// Create a new submission (omit id as backend assigns it)
export function addSubmission(submissionData: Omit<Submission, "id" | "submittedAt" | "status" | "result" | "score">): Promise<Submission> {
  return fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submissionData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to submit solution");
      return res.json();
    })
    .catch((err) => {
      console.error("Error adding submission:", err);
      throw err;
    });
}

// Get a specific submission by ID
export function readSubmission(submissionId: string): Promise<Submission> {
  return fetch(`${API_BASE}/${submissionId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Submission not found");
      return res.json();
    })
    .catch((err) => {
      console.error("Error reading submission:", err);
      throw err;
    });
}

// Get all submissions
export function readSubmissions(): Promise<Submission[]> {
  return fetch(API_BASE)
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      return data;
    })
    .catch((err) => {
      console.error("Error fetching submissions:", err);
      throw err;
    });
}

// Update a submission by ID (partial update allowed)
export function updateSubmission(
  submissionId: string,
  updatedData: Partial<Omit<Submission, "id" | "submittedAt">>
): Promise<Submission> {
  return fetch(`${API_BASE}/${submissionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update submission");
      return res.json();
    })
    .catch((err) => {
      console.error("Error updating submission:", err);
      throw err;
    });
}

// Delete a submission by ID
export function deleteSubmission(submissionId: string): Promise<{ message: string }> {
  return fetch(`${API_BASE}/${submissionId}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete submission");
      return res.json();
    })
    .catch((err) => {
      console.error("Error deleting submission:", err);
      throw err;
    });
}
