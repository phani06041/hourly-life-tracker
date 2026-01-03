import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <button
        className="home-btn"
        onClick={() => navigate("/daily")}
      >
        Daily Tracker
      </button>

      <button
        className="home-btn"
        onClick={() => navigate("/spend")}
      >
        Spend Tracker
      </button>
    </div>
  );
}
