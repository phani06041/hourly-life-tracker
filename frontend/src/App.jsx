import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DayTracker from "./pages/DayTracker";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <div className="container">
      <h1>Hourly Life & Spend Tracker</h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<DayTracker />} />
        <Route path="/spend" element={<Analytics />} />
      </Routes>
    </div>
  );
}
