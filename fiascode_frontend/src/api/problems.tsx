
const API_BASE = `http://${process.env.BACKEND_IP}/api/problems`;
interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  score: number;
  codeBase: string;
  testcases: TestCase[];
  constraintLimit: number;
  // other fields relevant to your Problem entity
}

//Create a new problem
export function addProblem(problemData: Omit<Problem, "id">): Promise<Problem>{
    return fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problemData),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to add problem");
            return res.json();
        })
        .catch((err) => {
            console.error("Error adding problem:", err);
        });
}

// Get a single problem by ID
export function readProblem(problemId:string) {
    return fetch(`${API_BASE}/${problemId}`, {credentials: "include",})
        .then((res) => {
            if (!res.ok) throw new Error("Problem not found");
            return res.json();
        })
        .catch((err) => {
            console.error("Error reading problem:", err);
        });
}

//Get all problems
export function readProblems():Promise<Problem[]> {
    return fetch(API_BASE, {credentials: "include",})
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch problems");
            return res.json();
        })
        .catch((err) => {
            console.error("Error fetching problems:", err);
        });
}

//Update a problem
export function updateProblem(problemId:string, updatedData: Partial<Omit<Problem, "id">>): Promise<Problem> {
    return fetch(`${API_BASE}/${problemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to update problem");
            return res.json();
        })
        .catch((err) => {
            console.error("Error updating problem:", err);
        });
}

//Delete a problem
export function deleteProblem(problemId:string) {
    return fetch(`${API_BASE}/${problemId}`, {
        method: "DELETE",
        credentials: "include",
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to delete problem");
            return res.json();
        })
        .catch((err) => {
            console.error("Error deleting problem:", err);
        });
}
