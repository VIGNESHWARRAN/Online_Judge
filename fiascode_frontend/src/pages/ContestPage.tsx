import React, { useEffect, useState, useContext } from "react";
import { readContests, registerUser, unregisterUserFromContest } from "../api/contests";
import { updateUserContest } from "../api/users";
import { AuthContext } from "../api/authuser";
import { RequireAuth } from "../components/RequireAuth";

export default function ContestRegisterPage() {
  const [contests, setContests] = useState<any[]>([]);
  const [userContests, setUserContests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { user } = useContext(AuthContext);
  const userId = user.sub;

  useEffect(() => {
    async function fetchContests() {
      try {
        const contestsData = await readContests();
        setContests(contestsData);

        const registeredIds = contestsData
          .filter((c) => c.participants?.includes(userId))
          .map((c) => c.id || c._id);

        setUserContests(registeredIds);
      } catch (err) {
        console.error("Failed to load contests:", err);
      }
    }
    fetchContests();
  }, [userId]);

  const handleRegister = async (contestId: string) => {
    setLoading(true);
    setMessage("");
    try {
      await registerUser(contestId, userId);
      await updateUserContest(userId, contestId);
      setUserContests((prev) => [...prev, contestId]);
      setMessage("Successfully registered for the contest!");
      alert("Successfully registered for the contest!");
    } catch (err) {
      setMessage("Registration failed. Please try again.");
      alert("Registration failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (contestId: string) => {
    setLoading(true);
    setMessage("");
    try {
      await unregisterUserFromContest(contestId, userId);
      await updateUserContest(userId, null);
      setUserContests((prev) => prev.filter((id) => id !== contestId));
      setMessage("Successfully unregistered from the contest!");
      alert("Successfully unregistered from the contest!");
    } catch (err) {
      setMessage("Unregistration failed. Please try again.");
      alert("Unregistration failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  return (
    <RequireAuth allowedTypes={[]}>
      <div className="min-h-screen bg-gradient-to-br from-[#1e202f] to-[#2c2d40] p-8 text-white font-sans flex flex-col">
        {/* Top bar with back button and title */}
        <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition"
            aria-label="Back to Editor"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Editor</span>
          </button>
          <h1 className="text-4xl font-bold text-center flex-grow text-indigo-400">
            Contest Registration
          </h1>
          {/* Empty placeholder to balance flex */}
          <div style={{ width: 120 }} />
        </div>

        {message && (
          <p className="mb-6 max-w-4xl mx-auto w-full text-center text-green-400 font-semibold select-none">
            {message}
          </p>
        )}

        <div className="max-w-4xl mx-auto w-full">
          {contests.length === 0 ? (
            <p className="text-center text-gray-400 text-lg select-none">No contests available.</p>
          ) : (
            <ul className="space-y-6">
              {contests.map((contest) => {
                const cid = contest.id || contest._id;
                const ended = new Date(contest.end) < now;
                const registered = userContests.includes(cid);

                return (
                  <li
                    key={cid}
                    className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-lg"
                  >
                    <div className="mb-4 md:mb-0 md:flex-1">
                      <h2 className="text-2xl font-semibold text-indigo-300">{contest.name}</h2>
                      <p className="text-gray-400 mt-1 select-text">
                        {new Date(contest.start).toLocaleString()} -{" "}
                        {new Date(contest.end).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {ended && (
                        <span className="text-red-500 font-semibold whitespace-nowrap select-none">
                          Contest Ended
                        </span>
                      )}

                      {!ended && registered && (
                        <>
                          <span className="text-green-500 font-semibold select-none whitespace-nowrap">
                            Registered
                          </span>
                          <button
                            onClick={() => handleUnregister(cid)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition"
                          >
                            Leave Contest
                          </button>
                        </>
                      )}

                      {!ended && !registered && (
                        <button
                          onClick={() => handleRegister(cid)}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
