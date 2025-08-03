const API_BASE = `http://${process.env.BACKEND_IP}/api/users`;

// Define the User interface based on your expected user schema.
// Adjust or expand fields as necessary.
export interface User {
  id: string;
  name?: string;
  email?: string;
  type?: "user" | "admin" | string;
  contests?: string[];         // Array of contest IDs if applicable
  // Add other user-related fields here
}

// CREATE a new user (omit 'id' as backend generates it)
export function addUser(userData: Omit<User, "id">): Promise<User> {
  return fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to add user");
      return res.json();
    })
    .catch((err) => {
      console.error("Error adding user:", err);
      throw err;
    });
}

// READ one user by ID
export function readUser(userId: string): Promise<User> {
  return fetch(`${API_BASE}/${userId}`)
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("User not found");
    })
    .catch((err) => {
      console.error("Error reading user:", err);
      throw err;
    });
}

// READ all users
export function readUsers(): Promise<User[]> {
  return fetch(API_BASE, { credentials: "include" })
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("Failed to fetch users");
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      throw err;
    });
}

// UPDATE user by ID (support partial updates)
export function updateUser(userId: string, updatedData: Partial<Omit<User, "id">>): Promise<User> {
  return fetch(`${API_BASE}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updatedData),
  })
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("Failed to update user");
    })
    .catch((err) => {
      console.error("Error updating user:", err);
      throw err;
    });
}

// DELETE user by ID
export function deleteUser(userId: string): Promise<{ message: string }> {
  return fetch(`${API_BASE}/${userId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("Failed to delete user");
    })
    .catch((err) => {
      console.error("Error deleting user:", err);
      throw err;
    });
}

// PATCH update user's contest field (e.g., assign a contestId to user)
export function updateUserContest(userId: string, contestId: string): Promise<User> {
  return fetch(`${API_BASE}/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ contest: contestId }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update user contest");
      return res.json();
    })
    .catch((err) => {
      console.error("Error updating user contest:", err);
      throw err;
    });
}
