import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import AdminPage from "./pages/AdminPage";
import CodeEditorPage from "./pages/CodeEditorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/editor" element={<CodeEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
