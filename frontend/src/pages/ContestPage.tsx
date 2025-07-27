import React, { useEffect, useState, useContext } from "react";
import { readContests, registerUser } from "../api/contests";
import { AuthContext } from "../api/authuser";

export default function ContestRegisterPage() {
  const [contests, setContests] = useState([]);
  const [userContests, setUserContests] = useState([]);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [message, setMessage] = useState("");

  const { user } = useContext(AuthContext);
  const userId = user.sub;

  useEffect(() => {
    async function fetchContests() {
      try {
        const contestsData = await readContests();
        setContests(contestsData);
        // Find contests user already registered for
        const registeredIds = contestsData
          .filter((c) => c.participants && c.participants.includes(userId))
          .map((c) => c.id || c._id);
        setUserContests(registeredIds);
      } catch (err) {
        console.error("Failed to load contests:", err);
      }
    }
    fetchContests();
  }, [userId]);

  const handleRegister = async (contestId) => {
    setLoadingRegistration(true);
    setMessage("");
    try {
      await registerUser(contestId, userId);
      setUserContests((prev) => [...prev, contestId]);
      setMessage("Successfully registered for the contest!");
      alert("Successfully registered for the contest!");
    } catch (err) {
      setMessage("Registration failed. Please try again.");
      alert("Registration failed!");
      console.error(err);
    } finally {
      setLoadingRegistration(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white font-sans">
      <h1 className="text-4xl font-bold mb-6 text-center">Contest Registration</h1>

      {message && (
        <p className="mb-6 text-center text-green-400 font-semibold">{message}</p>
      )}

      {contests.length === 0 ? (
        <p className="text-center text-gray-400">No contests available.</p>
      ) : (
        <ul className="max-w-3xl mx-auto space-y-4">
          {contests.map((contest) => {
            const cid = contest.id || contest._id;
            const now = new Date();
            const ended = new Date(contest.end) < now;
            const registered = userContests.includes(cid);

            return (
              <li
                key={cid}
                className="bg-gray-800 p-6 rounded flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div className="mb-4 md:mb-0 md:flex-1">
                  <h2 className="text-2xl font-semibold">{contest.name}</h2>
                  <p className="text-gray-300 mt-1">
                    {new Date(contest.start).toLocaleString()} -{" "}
                    {new Date(contest.end).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {ended && (
                    <span className="text-red-500 font-semibold">Contest Ended</span>
                  )}
                  {!ended && registered && (
                    <span className="text-green-500 font-semibold">Registered</span>
                  )}
                  {!ended && !registered && (
                    <button
                      onClick={() => handleRegister(cid)}
                      disabled={loadingRegistration}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
                    >
                      Register
                    </button>
                  )}
                  {/* Optional: If you want an anchor to detailed contest page */}
                  {/* <a
                    href={`/contest/${cid}`}
                    className="text-teal-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Details
                  </a> */}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
