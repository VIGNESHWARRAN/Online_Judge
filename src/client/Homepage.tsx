import { useAuth0 } from "@auth0/auth0-react";

function HomePage() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) return <>Loading...</>;

  return isAuthenticated ? (
    <>
      <h1> Not yet done with the code editor page </h1>
    </>
  ) : (
    <>
      {error && <p className="text-red-500 text-center">Error: {error.message}</p>}

      <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
        <main className=" mb-4 relative flex-grow flex flex-col justify-center items-center text-center px-6 py-24 rounded-t-3xl rounded-b-3xl bg-indigo-700 shadow-inner">
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
              onClick={() => login()}
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
              Helps you sharpen your debugging skills,  <span className="text-indigo-600 font-semibold">FIASCOde</span> provides real-time judge feedback,
              AI suggestions, and performance insights.
            </p>
          </div>
        </section>

        <footer className="text-center py-6 bg-gray-900 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} FIASCOde. All rights reserved.
        </footer>
      </div>

    </>

  );
}
export default HomePage;
