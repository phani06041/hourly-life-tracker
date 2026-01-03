import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <p className="subtitle">
        Track every hour of your life and every rupee you spend.
      </p>

      <div className="home-actions">
        <button onClick={() => navigate("/daily")}>
          Daily Tracker
        </button>

        <button onClick={() => navigate("/spend")}>
          Spend Tracker
        </button>
      </div>
    </div>
  );
}
