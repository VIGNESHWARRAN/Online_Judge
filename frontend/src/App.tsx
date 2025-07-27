import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import AdminPage from "./pages/AdminPage";
import CodeEditorPage from "./pages/CodeEditorPage";
import { RequireAuth } from "./components/RequireAuth";
import { AuthProvider } from "./api/authuser";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<HomePage />} />

          {/* Admin Protected Route */}
          <Route
            path="/admin"
            element={
              <RequireAuth allowedTypes={["admin"]}>
                <AdminPage />
              </RequireAuth>
            }
          />

          {/* User and Admin Protected Route */}
          <Route
            path="/editor"
            element={
              <RequireAuth allowedTypes={["user", "admin"]}>
                <CodeEditorPage />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
