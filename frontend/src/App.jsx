import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import DayTracker from "./pages/DayTracker.jsx";
import SpendTracker from "./pages/SpendTracker.jsx";



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
      </Routes>
    </div>
  );
}
