import React, { useEffect, useState, useContext } from "react";
import {
  readContests,
  registerUser,
  unregisterUserFromContest,
  validateContestPassword,
} from "../api/contests";
import { updateUserContest } from "../api/users";
import { AuthContext } from "../api/authuser";
import { useContestSession } from "../api/CreateSessionContext";
import { RequireAuth } from "../components/RequireAuth";
import { useNavigate } from "react-router-dom";

export default function ContestRegisterPage() {
  const navigate = useNavigate();
  const { startSession } = useContestSession();
  const [contests, setContests] = useState([]);
  const [userContests, setUserContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedContestToStart, setSelectedContestToStart] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { user, logout } = useContext(AuthContext);
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

  const registerAndUpdate = async (contestId) => {
    setLoading(true);
    setMessage("");
    try {
      await registerUser(contestId, userId);
      await updateUserContest(userId, contestId);
      setUserContests([contestId]);
      setMessage("Successfully registered for the contest!");
    } catch (err) {
      setMessage("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowPasswordPrompt(false);
    }
  };

  const handleRegister = async (contest) => {
    if (contest.password) {
      setSelectedContestToStart(contest);
      setPasswordInput("");
      setPasswordError("");
      setShowPasswordPrompt(true);
    } else {
      registerAndUpdate(contest.id || contest._id);
    }
  };

  const handleUnregister = async (contestId) => {
    setLoading(true);
    setMessage("");
    try {
      await unregisterUserFromContest(contestId, userId);
      await updateUserContest(userId, null);
      setUserContests([]);
      setMessage("Successfully unregistered from the contest!");
    } catch (err) {
      setMessage("Unregistration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const handleStartClick = (contest) => {
    if (contest.password) {
      setSelectedContestToStart(contest);
      setPasswordInput("");
      setPasswordError("");
      setShowPasswordPrompt(true);
    } else {
      navigate(-1);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError("");
    setLoading(true);
    try {
      const data = await validateContestPassword(
        selectedContestToStart.id || selectedContestToStart._id,
        passwordInput
      );

      if (data.valid) {
        await registerAndUpdate(selectedContestToStart.id || selectedContestToStart._id);
        const durationMinutes: number = selectedContestToStart.duration || 0;
        if (durationMinutes > 0) {
          startSession(durationMinutes);
        }
        navigate(-1);
      } else {
        setPasswordError("Invalid password. Please try again.");
      }
    } catch (error) {
      setPasswordError("Error validating password.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth allowedTypes={["user", "admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#1e202f] to-[rgb(44,45,64)] p-4 md:p-8 text-white font-sans flex flex-col">
        {/* --- 2. UPDATED TOP BAR (Justify Between) --- */}
        <div className="w-[95%] flex justify-between items-center mb-4 ml-[2%]">
          {/* Left Side: Go to Editor Button */}
          <div>
            {userContests.length > 0 && (
              <button
                onClick={() => navigate("/editor")}
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

          {/* Right Side: Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition shadow-md"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 w-full max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-center text-indigo-400 flex-grow">
            Contest Registration
          </h1>
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
                const startDate = new Date(contest.start);
                const endDate = new Date(contest.end);
                const ended = endDate < now;
                const registered = userContests.includes(cid);
                const notStartedYet = startDate > now; // contest start time in future

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
                        {startDate.toLocaleString()} - {endDate.toLocaleString()}
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
                            onClick={() => handleStartClick(contest)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-5 py-2 rounded ml-2 text-sm md:text-base"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleUnregister(cid)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base ml-2 transition"
                          >
                            Leave Contest
                          </button>
                        </>
                      )}

                      {!ended && !registered && (
                        <button
                          onClick={() => handleRegister(contest)}
                          disabled={loading || userContests.length > 0 || notStartedYet}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base transition"
                        >
                          {userContests.length > 0
                            ? "Already in a contest"
                            : notStartedYet
                            ? "Not started yet"
                            : "Register"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {showPasswordPrompt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded shadow-lg w-80 text-white">
              <h3 className="text-lg font-bold mb-4">Enter Contest Password</h3>
              <input
                type="password"
                className="w-full p-2 rounded mb-4 bg-zinc-900 text-white"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {passwordError && (
                <p className="text-red-500 mb-2">{passwordError}</p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
