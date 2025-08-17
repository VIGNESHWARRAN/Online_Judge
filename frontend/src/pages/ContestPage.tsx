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
      setUserContests([contestId]); // ✅ allow only 1 contest at a time
      setMessage("Successfully registered for the contest!");
    } catch (err) {
      setMessage("Registration failed. Please try again.");
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
      setUserContests([]); // ✅ clear all registrations
      setMessage("Successfully unregistered from the contest!");
    } catch (err) {
      setMessage("Unregistration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  return (
    <RequireAuth allowedTypes={[]}>
      <div className="min-h-screen bg-gradient-to-br from-[#1e202f] to-[#2c2d40] p-4 md:p-8 text-white font-sans flex flex-col">
        <div className="w-[95%] flex justify-start mb-4 ml-[2%]">
          {userContests.length > 0 && (
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 md:px-4 py-2 rounded font-semibold transition"
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
              <span>Go to Editor</span>
            </button>
          )}
        </div>


        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 w-full max-w-5xl mx-auto">


          <h1 className="text-2xl md:text-4xl font-bold text-center text-indigo-400 flex-grow">
            Contest Registration
          </h1>

          {/* Spacer for symmetry */}
          <div className="hidden md:block" style={{ width: 120 }} />
        </div>

<p className="text-center text-yellow-400 font-medium md:font-semibold mb-4 md:mb-6 w-full max-w-3xl mx-auto select-none text-base md:text-lg">
  Must register to start attending questions. Register for only one contest at a time.
</p>


        {message && (
          <p className="mb-4 md:mb-6 w-full max-w-3xl mx-auto text-center text-green-400 font-medium md:font-semibold text-sm md:text-base select-none">
            {message}
          </p>
        )}

        <div className="w-full max-w-5xl mx-auto">
          {contests.length === 0 ? (
            <p className="text-center text-gray-400 text-base md:text-lg select-none">
              No contests available.
            </p>
          ) : (
            <ul className="space-y-4 md:space-y-6">
              {contests.map((contest) => {
                const cid = contest.id || contest._id;
                const ended = new Date(contest.end) < now;
                const registered = userContests.includes(cid);

                return (
                  <li
                    key={cid}
                    className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-lg"
                  >
                    <div className="mb-3 md:mb-0 md:flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-indigo-300">
                        {contest.name}
                      </h2>
                      <p className="text-gray-400 mt-1 text-sm md:text-base select-text">
                        {new Date(contest.start).toLocaleString()} -{" "}
                        {new Date(contest.end).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                      {ended && (
                        <span className="text-red-500 font-semibold whitespace-nowrap text-sm md:text-base select-none">
                          Contest Ended
                        </span>
                      )}

                      {!ended && registered && (
                        <>
                          <span className="text-green-500 font-semibold whitespace-nowrap text-sm md:text-base select-none">
                            Registered
                          </span>
                          <button
                            onClick={() => handleUnregister(cid)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base transition"
                          >
                            Leave Contest
                          </button>
                        </>
                      )}

                      {!ended && !registered && (
                        <button
                          onClick={() => handleRegister(cid)}
                          disabled={loading || userContests.length > 0} // ✅ Disable if already registered
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base transition"
                        >
                          {userContests.length > 0 ? "Already in a contest" : "Register"}
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
