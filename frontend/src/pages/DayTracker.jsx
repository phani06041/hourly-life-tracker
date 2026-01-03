import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// ---------- CONSTANTS ----------
const LEGEND = {
  1: { label: "Sleep", color: "#4f6ef7" },
  2: { label: "Travel", color: "#17a2b8" },
  3: { label: "Work", color: "#28a745" },
  4: { label: "Chores", color: "#f7b500" },
  5: { label: "Exercise", color: "#ff4d4f" },
  6: { label: "Leisure", color: "#8e6df7" },
  7: { label: "Misc / Prep", color: "#6c757d" }
};

const emptyHours = () => Array(24).fill(0);

// ---------- COMPONENT ----------
export default function DayTracker() {
  const navigate = useNavigate();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [hours, setHours] = useState(emptyHours());
  const [spent, setSpent] = useState(0);
  const [weight, setWeight] = useState(0);
  const [comment, setComment] = useState("");

  const [selectedActivity, setSelectedActivity] = useState(1);
  const [isPainting, setIsPainting] = useState(false);
  const [is24Hour, setIs24Hour] = useState(false);

  // ---------- LOAD DAY ----------
  useEffect(() => {
    axios
      .get(`http://localhost:5001/api/day/${date}`)
      .then((res) => {
        if (!res.data) return;

        setHours(
          Array.from({ length: 24 }, (_, i) => res.data.hours?.[i] || 0)
        );
        setSpent(res.data.spent || 0);
        setWeight(res.data.weight || 0);
        setComment(res.data.comment || "");
      })
      .catch(() => {
        setHours(emptyHours());
        setSpent(0);
        setWeight(0);
        setComment("");
      });
  }, [date]);

  // ---------- SAVE ----------
  const saveDay = async () => {
    const payload = {
      date,
      hours: Object.fromEntries(hours.map((v, i) => [i, v])),
      spent,
      weight,
      comment
    };

    await axios.post("http://localhost:5001/api/day", payload);
    alert("Saved");
  };

  // ---------- HELPERS ----------
  const paintHour = (index) => {
    setHours((prev) => {
      const copy = [...prev];
      copy[index] = selectedActivity;
      return copy;
    });
  };

  const formatHour = (h) => {
    if (is24Hour) return `${h}:00`;

    const hour = h % 12 || 12;
    return `${hour} ${h < 12 ? "AM" : "PM"}`;
  };

  // ---------- ANALYTICS ----------
  const counts = {};
  hours.forEach((h) => {
    if (h) counts[h] = (counts[h] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(counts).map((k) => LEGEND[k].label),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map(
          (k) => LEGEND[k].color
        )
      }
    ]
  };

  // ---------- UI ----------
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1>Hourly Life & Spend Tracker</h1>

      <button onClick={() => navigate("/")}>← Back</button>

      <h2>Daily Tracker</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={() => setIs24Hour(!is24Hour)}>
        Switch to {is24Hour ? "12-Hour" : "24-Hour"}
      </button>

      {/* LEGEND */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {Object.entries(LEGEND).map(([k, v]) => (
          <div
            key={k}
            onClick={() => setSelectedActivity(Number(k))}
            style={{
              background: v.color,
              padding: "6px 10px",
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
              border:
                selectedActivity === Number(k)
                  ? "2px solid black"
                  : "none"
            }}
          >
            {k} – {v.label}
          </div>
        ))}
      </div>

      {/* HOURS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(24, 1fr)",
          gap: 4
        }}
        onMouseUp={() => setIsPainting(false)}
      >
        {hours.map((val, i) => (
          <div
            key={i}
            onMouseDown={() => {
              setIsPainting(true);
              paintHour(i);
            }}
            onMouseEnter={() => {
              if (isPainting) paintHour(i);
            }}
            style={{
              height: 45,
              background: LEGEND[val]?.color || "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
              color: val ? "#fff" : "#000",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              userSelect: "none"
            }}
          >
            <div>{formatHour(i)}</div>
            <div>{val}</div>
          </div>
        ))}
      </div>

      {/* INPUTS */}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <input
          type="number"
          placeholder="₹ Spent"
          value={spent}
          onChange={(e) => setSpent(+e.target.value)}
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(+e.target.value)}
        />
        <textarea
          placeholder="Comment / Highlight"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ flex: 1, resize: "vertical" }}
        />
      </div>

      <button onClick={saveDay} style={{ marginTop: 10 }}>
        Save Day
      </button>

      {/* ANALYTICS */}
      <h3 style={{ marginTop: 30 }}>Daily Time Distribution</h3>
      {Object.keys(counts).length > 0 && (
        <div style={{ width: 300 }}>
          <Doughnut data={doughnutData} />
        </div>
      )}
    </div>
  );
}
