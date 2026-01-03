import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import DayTracker from "./pages/DayTracker.jsx";
import SpendTracker from "./pages/SpendTracker.jsx";
import TimeAnalytics from "./pages/TimeAnalytics";
import CommentsAnalytics from "./pages/CommentsAnalytics";




export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Hourly Life & Spend Tracker</h1>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<DayTracker />} />
        <Route path="/spend" element={<SpendTracker />} />
        <Route path="/analytics" element={<TimeAnalytics />} />
        <Route path="/comments" element={<CommentsAnalytics />} />
      </Routes>
    </div>
  );
}
