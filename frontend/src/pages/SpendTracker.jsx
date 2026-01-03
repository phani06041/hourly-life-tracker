import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
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
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year);
  const [data, setData] = useState({});

useEffect(() => {
  fetch(`http://localhost:5001/api/analytics/spend?year=${selectedYear}`)
    .then(res => res.json())
    .then(data => setData(data || {}));
}, [selectedYear]);


  const labels = Object.keys(data);
  const values = Object.values(data);

  return (
    <div className="container">
      <h1>Hourly Life & Spend Tracker</h1>

      <button onClick={() => navigate("/")}>← Back</button>

      <h2>Spend Tracker</h2>

      <label>
        Year:{" "}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      {labels.length > 0 && (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Monthly Spend (₹)",
                data: values,
                backgroundColor: "#4f6ef7",
              },
            ],
          }}
        />
      )}
    </div>
  );
}
