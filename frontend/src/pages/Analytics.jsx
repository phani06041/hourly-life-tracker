import { Doughnut, Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("");
  const [hours, setHours] = useState({});
  const [spend, setSpend] = useState({});

  useEffect(() => {
    let qs = `?year=${year}`;
    if (month) qs += `&month=${month}`;

    fetch(`http://localhost:5001/api/analytics/hours${qs}`)
      .then(r => r.json())
      .then(setHours);

    fetch(`http://localhost:5001/api/analytics/spend${qs}`)
      .then(r => r.json())
      .then(setSpend);
  }, [year, month]);

  return (
    <div>
      <h2>Spend Tracker</h2>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        <select value={month} onChange={e => setMonth(e.target.value)}>
          <option value="">All Months</option>
          {[...Array(12).keys()].map(m => {
            const val = String(m + 1).padStart(2, "0");
            return (
              <option key={val} value={val}>
                {val}
              </option>
            );
          })}
        </select>
      </div>

      {/* HOURS DONUT */}
      {Object.keys(hours).length === 0 ? (
        <p>No activity data</p>
      ) : (
        <Doughnut
          data={{
            labels: Object.keys(hours),
            datasets: [{ data: Object.values(hours) }]
          }}
        />
      )}

      {/* SPEND BAR */}
      {Object.keys(spend).length === 0 ? (
        <p>No spend data</p>
      ) : (
        <Bar
          data={{
            labels: Object.keys(spend),
            datasets: [
              {
                label: "Monthly Spend (₹)",
                data: Object.values(spend)
              }
            ]
          }}
        />
      )}
    </div>
  );
}
