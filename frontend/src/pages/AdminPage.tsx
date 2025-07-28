import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  addUser,
  readUsers,
  deleteUser,
  updateUser,
} from "../api/users";

import {
  addProblem,
  readProblems,
  deleteProblem,
  updateProblem,
} from "../api/problems";

import {
  addContest,
  readContests,
  deleteContest,
  updateContest,
  addProblemToContest,
} from "../api/contests";

import { v4 as uuidv4 } from "uuid";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState("users");
  const [selectedContestId, setSelectedContestId] = useState("practice"); // For filtering problems list

  // Users state
  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    email: "",
    type: "user",
  });
  const [editUserId, setEditUserId] = useState(null);

  // Problems state
  const [newProblem, setNewProblem] = useState({
    id: "",
    title: "",
    description: "",
    score: 0,
    codeBase: "",
    testcases: [{ input: "", output: "" }],
    constraintLimit: 0,
  });
  const [editProblemId, setEditProblemId] = useState(null);

  // Contests state
  const [newContest, setNewContest] = useState({
    id: "",
    name: "",
    start: null,
    end: null,
  });
  const [editContestId, setEditContestId] = useState(null);

  // For tracking multi-selection of contests to assign a problem
  // Map of problemId => Set of selected contest ids
  const [problemContestSelections, setProblemContestSelections] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, problemsData, contestsData] = await Promise.all([
        readUsers(),
        readProblems(),
        readContests(),
      ]);

      // Ensure contests have a problems array
      const contestsWithProblems = (contestsData || []).map((c) => ({
        ...c,
        problems: c.problems || [],
      }));

      setUsers(usersData || []);
      setProblems(problemsData || []);
      setContests(contestsWithProblems);
      setError("");
    } catch {
      setError("Failed to load data");
    }
  };

  // -------- User Handlers --------
  const handleUserSave = async () => {
    const { id, name, email, type } = newUser;
    if (!id.trim() || !name.trim() || !email.trim() || !type.trim()) {
      setError("Fill all user fields.");
      return;
    }
    try {
      if (editUserId) {
        await updateUser(editUserId, newUser);
      } else {
        await addUser(newUser);
      }
      setNewUser({ id: "", name: "", email: "", type: "user" });
      setEditUserId(null);
      await fetchData();
      setError("");
    } catch {
      setError("Error saving user.");
    }
  };

  const handleEditUser = (user) => {
    setNewUser(user);
    setEditUserId(user.id);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      await fetchData();
    } catch {
      setError("Error deleting user");
    }
  };

  // -------- Problem Handlers --------
  const handleProblemSave = async () => {
    const { title, description, score, codeBase, testcases, constraintLimit } = newProblem;

    if (!title.trim() || !description.trim() || !score || !codeBase.trim() || !constraintLimit) {
      setError("Fill all problem and testcase fields.");
      return;
    }

    try {
      if (editProblemId) {
        const problemToUpdate = { ...newProblem };
        delete problemToUpdate.contestId;
        await updateProblem(editProblemId, problemToUpdate);
      } else {
        const newId = uuidv4();
        const problemToAdd = { ...newProblem };
        delete problemToAdd.contestId;
        problemToAdd.id = newId;
        await addProblem(problemToAdd);
      }
      setNewProblem({
        id: "",
        title: "",
        description: "",
        score: 0,
        codeBase: "",
        testcases: [{ input: "", output: "" }],
        constraintLimit: 0,
      });
      setEditProblemId(null);
      setError("");
      await fetchData();
    } catch (err) {
      setError("Error saving problem.");
      console.error(err);
    }
  };

  const handleEditProblem = (problem) => {
    const { contestId, ...rest } = problem;
    setNewProblem(rest);
    setEditProblemId(problem.id);
  };

  const handleDeleteProblem = async (id) => {
    try {
      await deleteProblem(id);

      // Remove problem id from all contests
      const contestsToUpdate = contests.filter((contest) =>
        contest.problems?.includes(id)
      );

      for (const contest of contestsToUpdate) {
        const updatedProblems = contest.problems.filter((pid) => pid !== id);
        const updatedContest = { ...contest, problems: updatedProblems };
        await updateContest(contest.id || contest._id, updatedContest);
      }

      await fetchData();
    } catch {
      setError("Error deleting problem");
    }
  };

  // -------- Contest Handlers --------
  const handleContestSave = async () => {
    const { name, start, end } = newContest;

    if (!name.trim() || !start || !end) {
      setError("Fill all contest fields.");
      return;
    }

    if (start >= end) {
      setError("Start date/time must be before end date/time.");
      return;
    }

    const contestToSave = {
      ...newContest,
      start: start.toISOString(),
      end: end.toISOString(),
      problems: newContest.problems || [],
    };

    try {
      if (editContestId) {
        await updateContest(editContestId, contestToSave);
      } else {
        const newId = uuidv4();
        await addContest({ ...contestToSave, id: newId });
      }
      setNewContest({ id: "", name: "", start: null, end: null });
      setEditContestId(null);
      await fetchData();
      setError("");
    } catch {
      setError("Error saving contest.");
    }
  };

  const handleEditContest = (contest) => {
    setNewContest({
      id: contest.id || contest._id || "",
      name: contest.name || "",
      start: contest.start ? new Date(contest.start) : null,
      end: contest.end ? new Date(contest.end) : null,
      problems: contest.problems || [],
    });
    setEditContestId(contest.id || contest._id);
  };

  const handleDeleteContest = async (id) => {
    try {
      await deleteContest(id);
      if (selectedContestId === id) setSelectedContestId("practice");
      await fetchData();
    } catch {
      setError("Error deleting contest");
    }
  };

  // Filter problems by selected contest or practice (unassigned)
  const filteredProblems = problems.filter((p) => {
    if (selectedContestId === "practice") {
      const assignedProblemIds = new Set();
      contests.forEach((c) => {
        (c.problems || []).forEach((pid) => assignedProblemIds.add(pid));
      });
      return !assignedProblemIds.has(p.id);
    } else {
      const contest = contests.find((c) => (c.id || c._id) === selectedContestId);
      if (!contest) return false;
      return (contest.problems || []).includes(p.id);
    }
  });

  // Toggle checkbox selection for contests to assign for a problem
  const toggleProblemContestSelection = (problemId, contestId) => {
    setProblemContestSelections((prev) => {
      const prevSet = prev[problemId] || new Set();
      const newSet = new Set(prevSet);
      if (newSet.has(contestId)) {
        newSet.delete(contestId);
      } else {
        newSet.add(contestId);
      }
      return { ...prev, [problemId]: newSet };
    });
  };

  // Use provided API helper to assign problem to selected contests
  const handleAssignProblemToContests = async (problemId) => {
    const selectedContestIds = problemContestSelections[problemId];
    if (!selectedContestIds || selectedContestIds.size === 0) {
      setError("Select at least one contest.");
      return;
    }
    try {
      let updatedAny = false;
      for (const contestId of selectedContestIds) {
        await addProblemToContest(contestId, problemId);
        updatedAny = true;
      }
      if (updatedAny) {
        setError("");
        setProblemContestSelections((prev) => ({ ...prev, [problemId]: new Set() }));
        await fetchData();
      }
    } catch (err) {
      setError("Error assigning problem to contests.");
      console.error(err);
    }
  };

  // Remove problem from contest
  const handleRemoveProblemFromContest = async (contestId, problemId) => {
    try {
      const contest = contests.find((c) => (c.id || c._id) === contestId);
      if (!contest) return;

      const updatedProblems = (contest.problems || []).filter((pid) => pid !== problemId);
      const updatedContest = { ...contest, problems: updatedProblems };

      await updateContest(contest.id || contest._id, updatedContest);
      await fetchData();
      setError("");
    } catch (err) {
      setError("Error removing problem from contest.");
      console.error(err);
    }
  };

  // Check if problem already assigned to a contest
  const isProblemAssignedToContest = (problemId, contestId) => {
    const contest = contests.find((c) => (c.id || c._id) === contestId);
    if (!contest) return false;
    return (contest.problems || []).includes(problemId);
  };

  // ----- Render Sections -----

  const renderUserSection = () => (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 text-white">👤 Manage Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="ID (auth0|...)"
          value={newUser.id}
          onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
        />
        <input
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <select
          className="p-2 bg-zinc-900 text-white rounded"
          value={newUser.type}
          onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleUserSave}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white"
        >
          {editUserId ? "Update User" : "Add User"}
        </button>
      </div>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="bg-zinc-800 text-white p-3 rounded flex justify-between items-center"
          >
            <span>
              {user.name} ({user.email}) - {user.type}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleEditUser(user)}
                className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  const renderProblemSection = () => (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-white">📘 Manage Problems</h2>

      {/* Contest selector for filtering */}
      <div className="mb-4">
        <label className="mr-2 text-white font-semibold">Filter Problems by Contest:</label>
        <select
          className="p-2 bg-zinc-900 text-white rounded"
          value={selectedContestId}
          onChange={(e) => setSelectedContestId(e.target.value)}
        >
          <option value="">Problems Not Assigned</option>
          {contests.map((contest) => (
            <option key={contest.id || contest._id} value={contest.id || contest._id}>
              {contest.name}
            </option>
          ))}
        </select>
      </div>

      {/* Problem input fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Title"
          value={newProblem.title}
          onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
        />
        <input
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Description"
          value={newProblem.description}
          onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
        />
        <input
          type="number"
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Score"
          value={newProblem.score}
          onChange={(e) => setNewProblem({ ...newProblem, score: Number(e.target.value) })}
        />

        <div className="col-span-1 md:col-span-3">
          <label className="block mb-1 text-white">Code Base File:</label>
          <input
            type="file"
            accept=".js,.py,.txt,.java,.cpp,*"
            className="p-2 bg-zinc-900 text-white rounded"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new window.FileReader();
              reader.onload = (ev) => {
                setNewProblem((prev) => ({ ...prev, codeBase: ev.target.result || "" }));
              };
              reader.onerror = () => {
                setError("Failed to read file.");
              };
              reader.readAsText(file);
            }}
          />
          {newProblem.codeBase && (
            <div className="text-xs mt-2 text-green-500">
              File loaded, {newProblem.codeBase.length} characters
            </div>
          )}
        </div>

        {/* Testcases input */}
        <div className="col-span-1 md:col-span-3">
          <label className="block mb-2 font-semibold text-white">Testcases:</label>
          {newProblem.testcases.map((tc, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                className="p-2 bg-zinc-900 text-white rounded flex-1"
                placeholder={`Input ${idx + 1}`}
                value={tc.input}
                onChange={(e) => {
                  const testcases = [...newProblem.testcases];
                  testcases[idx].input = e.target.value;
                  setNewProblem({ ...newProblem, testcases });
                }}
              />
              <input
                className="p-2 bg-zinc-900 text-white rounded flex-1"
                placeholder={`Output ${idx + 1}`}
                value={tc.output}
                onChange={(e) => {
                  const testcases = [...newProblem.testcases];
                  testcases[idx].output = e.target.value;
                  setNewProblem({ ...newProblem, testcases });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const testcases = newProblem.testcases.filter((_, i) => i !== idx);
                  setNewProblem({
                    ...newProblem,
                    testcases: testcases.length ? testcases : [{ input: "", output: "" }],
                  });
                }}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                disabled={newProblem.testcases.length === 1}
                title="Remove this testcase"
              >
                -
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            onClick={() =>
              setNewProblem({
                ...newProblem,
                testcases: [...newProblem.testcases, { input: "", output: "" }],
              })
            }
          >
            + Add Testcase
          </button>
        </div>

        <input
          type="number"
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Constraint Limit"
          value={newProblem.constraintLimit}
          onChange={(e) => setNewProblem({ ...newProblem, constraintLimit: Number(e.target.value) })}
        />

        <button
          onClick={handleProblemSave}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white col-span-1 md:col-span-3"
        >
          {editProblemId ? "Update Problem" : "Add Problem"}
        </button>
      </div>

      {/* Assign Problems to Contests Section */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-3">🔗 Assign Problems to Contests</h3>
        {problems.length === 0 && <p className="text-gray-400">No problems available yet.</p>}
        <ul className="space-y-4 max-h-[400px] overflow-auto">
          {problems.map((problem) => (
            <li
              key={problem.id}
              className="bg-zinc-700 p-4 rounded flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <strong>{problem.title}</strong> — Score: {problem.score}
                <div className="text-xs mt-1 text-gray-400">ID: {problem.id}</div>
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-3 max-w-lg">
                {contests.map((contest) => {
                  const contestId = contest.id || contest._id;
                  const isAssigned = isProblemAssignedToContest(problem.id, contestId);
                  const isSelected = problemContestSelections[problem.id]?.has(contestId) || false;

                  return (
                    <label
                      key={contestId}
                      title={contest.name}
                      className={`inline-flex items-center px-2 py-1 rounded cursor-pointer select-none ${
                        isSelected ? "bg-indigo-600" : "bg-zinc-900"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isAssigned}
                        checked={isAssigned || isSelected}
                        onChange={() => toggleProblemContestSelection(problem.id, contestId)}
                        className="mr-1"
                      />
                      <span className={isAssigned ? "line-through text-gray-400" : ""}>
                        {contest.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                disabled={
                  !problemContestSelections[problem.id] || problemContestSelections[problem.id].size === 0
                }
                onClick={() => handleAssignProblemToContests(problem.id)}
                className={`ml-0 md:ml-4 mt-3 md:mt-0 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white ${
                  !problemContestSelections[problem.id] ||
                  problemContestSelections[problem.id].size === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Assign Selected Contests
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Problems filtered */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-3">
          📄 {selectedContestId === "practice" ? "Practice Problems (No Contest Assigned)" : `Problems in Contest`}
        </h3>
        {filteredProblems.length === 0 && (
          <p className="text-gray-400">No problems to show for the selected filter.</p>
        )}
        <ul className="space-y-2">
          {filteredProblems.map((problem) => (
            <li
              key={problem.id}
              className="bg-zinc-800 text-white p-3 rounded flex justify-between items-center"
            >
              <span>
                <strong>{problem.title}</strong> — Score: {problem.score} | Limit: {problem.constraintLimit}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditProblem(problem)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProblem(problem.id)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );

  const renderContestSection = () => (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 text-white">🏆 Manage Contests</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input
          className="p-2 bg-zinc-900 text-white rounded"
          placeholder="Name"
          value={newContest.name}
          onChange={(e) => setNewContest({ ...newContest, name: e.target.value })}
        />

        <div>
          <label className="block mb-1 text-white font-semibold">Start Date & Time</label>
          <DatePicker
            selected={newContest.start}
            onChange={(date) => setNewContest((prev) => ({ ...prev, start: date }))}
            showTimeSelect
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="p-2 bg-zinc-900 text-white rounded w-full"
            placeholderText="Select start date & time"
          />
        </div>

        <div>
          <label className="block mb-1 text-white font-semibold">End Date & Time</label>
          <DatePicker
            selected={newContest.end}
            onChange={(date) => setNewContest((prev) => ({ ...prev, end: date }))}
            showTimeSelect
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="p-2 bg-zinc-900 text-white rounded w-full"
            placeholderText="Select end date & time"
          />
        </div>

        <div></div>

        <button
          onClick={handleContestSave}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
        >
          {editContestId ? "Update Contest" : "Add Contest"}
        </button>
      </div>

      <ul className="space-y-2">
        {contests.map((contest) => (
          <li
            key={contest.id || contest._id}
            className="bg-zinc-800 text-white p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center"
          >
            <div>
              <strong>{contest.name}</strong> — {new Date(contest.start).toLocaleString()} to{" "}
              {new Date(contest.end).toLocaleString()}
            </div>
            {/* Show problems in contest with Remove option */}
            <div className="mt-2 md:mt-0">
              {contest.problems && contest.problems.length > 0 ? (
                <details className="cursor-pointer bg-zinc-700 rounded p-2">
                  <summary className="font-semibold text-sm mb-1 text-white">
                    Problems ({contest.problems.length})
                  </summary>
                  <ul className="list-decimal list-inside max-h-48 overflow-auto text-sm">
                    {contest.problems.map((pid) => {
                      const problem = problems.find((p) => p.id === pid);
                      return (
                        <li key={pid} className="flex justify-between items-center">
                          <span>{problem ? problem.title : `Unknown Problem: ${pid}`}</span>
                          {problem && (
                            <button
                              onClick={() => handleRemoveProblemFromContest(contest.id || contest._id, pid)}
                              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs"
                              title="Remove Problem from Contest"
                            >
                              Remove
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              ) : (
                <span className="text-sm italic text-gray-400">No problems assigned</span>
              )}
            </div>
            <div className="space-x-2 mt-2 md:mt-0">
              <button
                onClick={() => handleEditContest(contest)}
                className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteContest(contest.id || contest._id)}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">🛠 Admin Dashboard</h1>

      {/* View tabs */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => setView("users")}
          className={`px-4 py-2 rounded ${view === "users" ? "bg-indigo-600" : "bg-zinc-800"}`}
        >
          Users
        </button>
        <button
          onClick={() => setView("problems")}
          className={`px-4 py-2 rounded ${view === "problems" ? "bg-blue-600" : "bg-zinc-800"}`}
        >
          Problems
        </button>
        <button
          onClick={() => setView("contests")}
          className={`px-4 py-2 rounded ${view === "contests" ? "bg-green-600" : "bg-zinc-800"}`}
        >
          Contests
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-600 text-white p-3 mb-6 rounded text-center">{error}</div>
      )}

      {/* View sections */}
      {view === "users"
        ? renderUserSection()
        : view === "problems"
        ? renderProblemSection()
        : renderContestSection()}
    </div>
  );
}
