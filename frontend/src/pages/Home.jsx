import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <p className="subtitle">Track • Analyze • Improve</p>

      <div className="home-actions">
        <button onClick={() => navigate("/daily")}>
          Daily Tracker
        </button>

        <button onClick={() => navigate("/spend")}>
          Spend Tracker
        </button>

        {/* ✅ NEW */}
        <button onClick={() => navigate("/analytics")}>
          Time Analytics
        </button>
      </div>
    </div>
  );
}
