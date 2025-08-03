
const API_BASE = `http://${process.env.BACKEND_IP}/api/problems`;

//Create a new problem
export function addProblem(problemData) {
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
export function readProblem(problemId) {
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
export function readProblems() {
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
export function updateProblem(problemId, updatedData) {
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
export function deleteProblem(problemId) {
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
