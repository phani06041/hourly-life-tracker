import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function SpendTracker() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:5001/api/analytics/spend?year=${year}`)
      .then((res) => setMonthlyData(res.data || {}))
      .catch(() => setMonthlyData({}));
  }, [year]);

  const labels = Object.keys(monthlyData);
  const values = Object.values(monthlyData);

  return (
    <div className="container">
      <h2>Spend Tracker</h2>

      <button onClick={() => navigate("/")}>← Back</button>

      <div style={{ margin: "10px 0" }}>
        <label>
          Year:&nbsp;
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      {labels.length === 0 ? (
        <p>No spend data for this year.</p>
      ) : (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Monthly Spend (₹)",
                data: values,
                backgroundColor: "#4f6ef7"
              }
            ]
          }}
        />
      )}
    </div>
  );
}
