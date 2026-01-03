import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// SAME LEGEND AS TRACKER
const LEGEND = {
  1: { label: "Sleep", color: "#4c6ef5" },
  2: { label: "Travel", color: "#15aabf" },
  3: { label: "Work", color: "#40c057" },
  4: { label: "Chores", color: "#fab005" },
  5: { label: "Exercise", color: "#fa5252" },
  6: { label: "Leisure", color: "#7950f2" },
  7: { label: "Misc / Prep", color: "#868e96" }
};

export default function Analytics() {
  const [hours, setHours] = useState({});
  const [spend, setSpend] = useState({});

  useEffect(() => {
    fetch("http://localhost:5001/api/analytics/hours")
      .then(r => r.json())
      .then(setHours);

    fetch("http://localhost:5001/api/analytics/spend")
      .then(r => r.json())
      .then(setSpend);
  }, []);

  // --- HOURS DONUT DATA ---
  const hourLabels = [];
  const hourValues = [];
  const hourColors = [];

  Object.entries(hours).forEach(([code, count]) => {
    if (!LEGEND[code] || count === 0) return;
    hourLabels.push(LEGEND[code].label);
    hourValues.push(count);
    hourColors.push(LEGEND[code].color);
  });

  // --- SPEND BAR DATA ---
  const spendLabels = Object.keys(spend);
  const spendValues = Object.values(spend);

  return (
    <div>
      <h2>Analytics</h2>

      {/* HOURS DISTRIBUTION */}
      <h3>Hourly Distribution</h3>
      {hourValues.length === 0 ? (
        <p>No hour data yet</p>
      ) : (
        <div style={{ maxWidth: 400 }}>
          <Doughnut
            data={{
              labels: hourLabels,
              datasets: [
                {
                  data: hourValues,
                  backgroundColor: hourColors
                }
              ]
            }}
          />
        </div>
      )}

      {/* SPEND TRACKER */}
      <h3 style={{ marginTop: 40 }}>Spend Tracker</h3>
      {spendValues.length === 0 ? (
        <p>No spend data yet</p>
      ) : (
        <div style={{ maxWidth: 700 }}>
          <Bar
            data={{
              labels: spendLabels,
              datasets: [
                {
                  label: "Monthly Spend (₹)",
                  data: spendValues,
                  backgroundColor: "#4c6ef5"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
