import React, { useEffect, useState } from "react";
import {
  addUser,
  readUsers,
  deleteUser,
} from "../api/users";

import {
  addProblem,
  readProblems,
  deleteProblem,
} from "../api/problems";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    email: "",
    type: "user",
  });

  const [newProblem, setNewProblem] = useState({
    title: "",
    description: "",
    score: 0,
    codeBase: "",
    testcase: "",
    constraintLimit: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await readUsers();
      const problemsData = await readProblems();
      setUsers(usersData || []);
      setProblems(problemsData || []);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.id || !newUser.name || !newUser.email || !newUser.type) {
      return setError("Fill all user fields.");
    }
    try {
      await addUser(newUser);
      await fetchData();
      setNewUser({ id: "", name: "", email: "", type: "user" });
      setError("");
    } catch (err) {
      setError("Error creating user.");
    }
  };

  const handleAddProblem = async () => {
    const { title, description, score, codeBase, testcase, constraintLimit } = newProblem;
    if (!title || !description || !score || !codeBase || !testcase || !constraintLimit) {
      return setError("Fill all problem fields.");
    }
    try {
      await addProblem(newProblem);
      await fetchData();
      setNewProblem({ title: "", description: "", score: 0, codeBase: "", testcase: "", constraintLimit: 0 });
      setError("");
    } catch (err) {
      setError("Error creating problem.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      await fetchData();
    } catch (err) {
      setError("Error deleting user");
    }
  };

  const handleDeleteProblem = async (id) => {
    try {
      await deleteProblem(id);
      await fetchData();
    } catch (err) {
      setError("Error deleting problem");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">🛠 Admin Dashboard</h1>

      {error && <div className="bg-red-600 text-white p-3 mb-6 rounded text-center">{error}</div>}

      {/* Users Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-white">👤 Manage Users</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="ID (auth0|...)" value={newUser.id} onChange={(e) => setNewUser({ ...newUser, id: e.target.value })} />
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <select className="p-2 bg-zinc-900 text-white rounded" value={newUser.type} onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white">
            Add User
          </button>
        </div>

        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="bg-zinc-800 text-white p-3 rounded flex justify-between items-center">
              <span>{user.name} ({user.email}) - {user.type}</span>
              <button onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Problems Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">📘 Manage Problems</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="Title" value={newProblem.title} onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })} />
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="Description" value={newProblem.description} onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })} />
          <input type="number" className="p-2 bg-zinc-900 text-white rounded" placeholder="Score" value={newProblem.score} onChange={(e) => setNewProblem({ ...newProblem, score: Number(e.target.value) })} />
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="Code Base" value={newProblem.codeBase} onChange={(e) => setNewProblem({ ...newProblem, codeBase: e.target.value })} />
          <input className="p-2 bg-zinc-900 text-white rounded" placeholder="Test Case" value={newProblem.testcase} onChange={(e) => setNewProblem({ ...newProblem, testcase: e.target.value })} />
          <input type="number" className="p-2 bg-zinc-900 text-white rounded" placeholder="Constraint Limit" value={newProblem.constraintLimit} onChange={(e) => setNewProblem({ ...newProblem, constraintLimit: Number(e.target.value) })} />
          <button onClick={handleAddProblem} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
            Add Problem
          </button>
        </div>

        <ul className="space-y-2">
          {problems.map((problem) => (
            <li key={problem._id} className="bg-zinc-800 text-white p-3 rounded flex justify-between items-center">
              <span><strong>{problem.title}</strong> — Score: {problem.score} | Limit: {problem.constraintLimit}</span>
              <button onClick={() => handleDeleteProblem(problem._id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
