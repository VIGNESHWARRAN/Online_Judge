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
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth allowedTypes={["admin"]}>
              <AdminPage />
            </RequireAuth>
          }
        />
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
