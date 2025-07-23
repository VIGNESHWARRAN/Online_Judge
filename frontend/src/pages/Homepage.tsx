import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthHandler } from "../api/authuser";

function HomePage() {
  const {
    isAuthenticated,
    error,
    login,
    signup,
    isLoading,
    type,
  } = useAuthHandler();

  const navigate = useNavigate();
  React.useEffect(() => {
    
    if (!isLoading && isAuthenticated) {
      console.log(type);
      if (type === "admin") {
        navigate("/admin");
      } else {
        navigate("/editor");
      }
    }
  }, [isLoading, isAuthenticated, type, navigate]);


  if (isLoading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
      {error && <p className="text-red-500 text-center">Error: {error.message}</p>}

      <main className="mb-4 relative flex-grow flex flex-col justify-center items-center text-center px-6 py-24 rounded-t-3xl rounded-b-3xl bg-indigo-700 shadow-inner">
        <div className="absolute inset-0 opacity-20 -z-10 bg-gradient-to-br from-indigo-500 via-indigo-700 to-purple-800"></div>

        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Code. Compete. Conquer.
        </h2>
        <p className="mb-8 text-indigo-100 leading-relaxed max-w-xl text-lg">
          Welcome to <span className="font-bold text-yellow-300">FIASCOde</span> — your arena for real-time code judging, AI feedback, and global competition.
        </p>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={signup}
            className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-700 hover:scale-105 transition duration-300 shadow-xl"
          >
            Get Started
          </button>
          <button
            onClick={login}
            className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-700 hover:scale-105 transition duration-300"
          >
            Login
          </button>
        </div>
      </main>

      <section
        id="about"
        className="bg-white text-gray-800 py-20 px-6 relative z-10 rounded-t-3xl rounded-b-3xl shadow-inner"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-extrabold mb-4">Why FIASCOde?</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Helps you sharpen your debugging skills. <span className="text-indigo-600 font-semibold">FIASCOde</span> provides real-time judge feedback, AI suggestions, and performance insights.
          </p>
        </div>
      </section>

      <footer className="text-center py-6 bg-gray-900 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} FIASCOde. All rights reserved.
      </footer>
    </div>
  );
}

export default HomePage;
