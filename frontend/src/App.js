import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import AnalyzePage from "@/components/AnalyzePage";
import ReviewAnalyzerPage from "@/components/ReviewAnalyzerPage";
import "@/App.css";
import "@/index.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#09090b] text-white transition-colors duration-300">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
            <Route
              path="/analyze"
              element={<AnalyzePage darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
            <Route
              path="/review-analyzer"
              element={<ReviewAnalyzerPage />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
