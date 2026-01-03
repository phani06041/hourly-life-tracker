import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LEGEND = {
  1: { label: "Sleep", color: "#4f6ef7" },
  2: { label: "Travel", color: "#17a2b8" },
  3: { label: "Work", color: "#28a745" },
  4: { label: "Chores", color: "#ffc107" },
  5: { label: "Exercise", color: "#ff4d4f" },
  6: { label: "Leisure", color: "#7b61ff" },
  7: { label: "Misc / Prep", color: "#6c757d" },
};

const emptyHours = () =>
  Array.from({ length: 24 }, () => 0);

export default function DayTracker() {
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState(emptyHours());
  const [spent, setSpent] = useState(0);
  const [weight, setWeight] = useState(0);
  const [comment, setComment] = useState("");
  const [is24Hour, setIs24Hour] = useState(false);

  /* ---------------- FETCH DAY ---------------- */
  useEffect(() => {
    axios
      .get(`http://localhost:5001/api/day/${date}`)
      .then((res) => {
        if (!res.data) {
          setHours(emptyHours());
          setSpent(0);
          setWeight(0);
          setComment("");
          return;
        }
        setHours(Object.values(res.data.hours));
        setSpent(res.data.spent || 0);
        setWeight(res.data.weight || 0);
        setComment(res.data.comment || "");
      })
      .catch(() => {
        setHours(emptyHours());
      });
  }, [date]);

  /* ---------------- SAVE ---------------- */
  const saveDay = async () => {
    await axios.post("http://localhost:5001/api/day", {
      date,
      hours: Object.fromEntries(hours.map((v, i) => [i, v])),
      spent,
      weight,
      comment,
    });
    alert("Saved");
  };

  /* ---------------- DONUT DATA ---------------- */
  const totals = {};
  hours.forEach((v) => {
    if (v > 0) totals[v] = (totals[v] || 0) + 1;
  });

  const donutData = {
    labels: Object.keys(totals).map(
      (k) => LEGEND[k].label
    ),
    datasets: [
      {
        data: Object.values(totals),
        backgroundColor: Object.keys(totals).map(
          (k) => LEGEND[k].color
        ),
      },
    ],
  };

  const formatHour = (h) => {
    if (is24Hour) return `${h}:00`;
    const hour = h % 12 || 12;
    return `${hour} ${h < 12 ? "AM" : "PM"}`;
  };

  return (
    <div className="container">
      <h1>Hourly Life & Spend Tracker</h1>

      <button onClick={() => navigate("/")}>← Back</button>

      <h2>Daily Tracker</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={() => setIs24Hour(!is24Hour)}>
        Switch to {is24Hour ? "12" : "24"}-Hour
      </button>

      {/* LEGEND */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {Object.entries(LEGEND).map(([k, v]) => (
          <span
            key={k}
            style={{
              background: v.color,
              padding: "4px 8px",
              color: "#fff",
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            {k} – {v.label}
          </span>
        ))}
      </div>

      {/* HOURS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 4 }}>
        {hours.map((val, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, textAlign: "center" }}>
              {formatHour(i)}
            </div>
            <input
              value={val}
              onChange={(e) => {
                const copy = [...hours];
                copy[i] = Number(e.target.value);
                setHours(copy);
              }}
              style={{
                width: "100%",
                background: LEGEND[val]?.color || "#fff",
                color: val ? "#fff" : "#000",
                textAlign: "center",
              }}
            />
          </div>
        ))}
      </div>

      {/* META */}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div>
          ₹ Spent
          <input value={spent} onChange={(e) => setSpent(e.target.value)} />
        </div>
        <div>
          Weight (kg)
          <input value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          Comment / Highlight
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", resize: "both" }}
          />
        </div>
      </div>

      <button onClick={saveDay}>Save Day</button>

      {/* DONUT */}
      <h3>Daily Time Distribution</h3>
      {Object.keys(totals).length > 0 && (
        <div style={{ maxWidth: 400 }}>
          <Doughnut data={donutData} />
        </div>
      )}
    </div>
  );
}
