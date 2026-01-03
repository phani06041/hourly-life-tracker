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

/* ================= CONSTANTS ================= */

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

/* ================= COMPONENT ================= */

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

  /* ================= LOAD DAY ================= */

  useEffect(() => {
    const loadDay = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/day/${date}`
        );

        if (!res.data) {
          setHours(emptyHours());
          setSpent(0);
          setWeight(0);
          setComment("");
          return;
        }

        setHours(
          Array.from({ length: 24 }, (_, i) => res.data.hours?.[i] ?? 0)
        );
        setSpent(res.data.spent ?? 0);
        setWeight(res.data.weight ?? 0);
        setComment(res.data.comment ?? "");

      } catch {
        setHours(emptyHours());
        setSpent(0);
        setWeight(0);
        setComment("");
      }
    };

    loadDay();
  }, [date]);

  /* ================= SAVE ================= */

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

  /* ================= HELPERS ================= */

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

  /* ================= ANALYTICS ================= */

  const activityStats = Object.entries(LEGEND)
    .map(([k, v]) => {
      const count = hours.filter((h) => h === Number(k)).length;
      return {
        key: k,
        label: v.label,
        color: v.color,
        hours: count
      };
    })
    .filter((a) => a.hours > 0);

  const totalTracked = activityStats.reduce(
    (sum, a) => sum + a.hours,
    0
  );

  const doughnutData = {
    labels: activityStats.map((a) => a.label),
    datasets: [
      {
        data: activityStats.map((a) => a.hours),
        backgroundColor: activityStats.map((a) => a.color),
        borderWidth: 2,
        borderColor: "#fff"
      }
    ]
  };

  const doughnutOptions = {
    cutout: "70%",
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const h = ctx.raw;
            const pct = ((h / totalTracked) * 100).toFixed(1);
            return `${ctx.label}: ${h}h (${pct}%)`;
          }
        }
      },
      legend: { display: false }
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Hourly Life & Spend Tracker</h1>

      <button onClick={() => navigate("/")}>← Back</button>

      <h2>Daily Tracker</h2>

      {/* DATE + FORMAT */}
      <div style={{ display: "flex", gap: 12 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={() => setIs24Hour(!is24Hour)}>
          Switch to {is24Hour ? "12-Hour" : "24-Hour"}
        </button>
      </div>

      {/* LEGEND PICKER */}
      <div className="legend-picker">
        {Object.entries(LEGEND).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setSelectedActivity(Number(k))}
            style={{
              background: v.color,
              border:
                selectedActivity === Number(k)
                  ? "2px solid black"
                  : "none"
            }}
          >
            {k} – {v.label}
          </button>
        ))}
      </div>

      {/* HOURS GRID */}
      <div
        className="hour-grid"
        onMouseUp={() => setIsPainting(false)}
      >
        {hours.map((val, i) => (
          <div
            key={i}
            className="hour-cell"
            onMouseDown={() => {
              setIsPainting(true);
              paintHour(i);
            }}
            onMouseEnter={() => {
              if (isPainting) paintHour(i);
            }}
            style={{
              background: LEGEND[val]?.color || "#fff",
              color: val ? "#fff" : "#000"
            }}
          >
            <div>{formatHour(i)}</div>
            <div>{val}</div>
          </div>
        ))}
      </div>

      {/* META INPUTS */}
      <div className="meta-row">
        <div className="meta-field">
          <label>Spent (₹)</label>
          <input
            type="number"
            value={spent}
            onChange={(e) => setSpent(+e.target.value)}
          />
        </div>

        <div className="meta-field">
          <label>Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
          />
        </div>

        <div className="meta-comment">
          <label>Comment / Highlight</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      <button onClick={saveDay} style={{ marginTop: 12 }}>
        Save Day
      </button>

      {/* ANALYTICS */}
      <h3 style={{ marginTop: 30 }}>Daily Time Distribution</h3>

      {activityStats.length > 0 ? (
        <div style={{ display: "flex", gap: 30 }}>
          <div style={{ position: "relative", width: 260 }}>
            <Doughnut
              data={doughnutData}
              options={doughnutOptions}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 24, fontWeight: "bold" }}>
                {totalTracked}h
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Total Logged
              </div>
            </div>
          </div>

          <div>
            {activityStats.map((a) => {
              const pct = ((a.hours / totalTracked) * 100).toFixed(1);
              return (
                <div key={a.key} style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: a.color,
                      display: "inline-block",
                      marginRight: 8
                    }}
                  />
                  <strong>{a.label}</strong> — {a.hours}h ({pct}%)
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p>No activities logged</p>
      )}
    </div>
  );
}
