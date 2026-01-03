import { useEffect, useState } from "react";

const API = "http://localhost:5001/api/day";

const LEGEND = {
  1: { label: "Sleep", color: "#4c6ef5" },
  2: { label: "Travel", color: "#15aabf" },
  3: { label: "Work", color: "#40c057" },
  4: { label: "Chores", color: "#fab005" },
  5: { label: "Exercise", color: "#fa5252" },
  6: { label: "Leisure", color: "#7950f2" },
  7: { label: "Misc / Prep", color: "#868e96" }
};

const emptyHours = () =>
  Object.fromEntries([...Array(24).keys()].map(h => [h, 0]));

export default function DayTracker() {
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState(emptyHours());
  const [spent, setSpent] = useState("");
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");
  const [timeFormat, setTimeFormat] = useState("24"); // "24" | "12"

  // ---- FORMAT HOUR LABEL ----
  const formatHourLabel = (hour) => {
    if (timeFormat === "24") return hour;
    const h = hour % 12 || 12;
    const suffix = hour < 12 ? "AM" : "PM";
    return `${h} ${suffix}`;
  };

  // ---- LOAD DAY ON DATE CHANGE ----
  useEffect(() => {
    if (!date) return;

    fetch(`${API}/date/${date}`)
      .then(r => r.json())
      .then(d => {
        if (!d) {
          setHours(emptyHours());
          setSpent("");
          setWeight("");
          setComment("");
          return;
        }
        setHours(d.hours || emptyHours());
        setSpent(d.spent ?? "");
        setWeight(d.weight ?? "");
        setComment(d.comment ?? "");
      });
  }, [date]);

  // ---- SAVE DAY ----
  const saveDay = async () => {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        hours,
        spent: Number(spent) || 0,
        weight: Number(weight) || 0,
        comment
      })
    });

    alert("Day saved");
  };

  return (
    <div>
      <h2>Daily Tracker</h2>

      {/* DATE */}
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {/* TIME FORMAT TOGGLE */}
      <div style={{ margin: "10px 0" }}>
        <button
          onClick={() =>
            setTimeFormat(timeFormat === "24" ? "12" : "24")
          }
        >
          Switch to {timeFormat === "24" ? "12-Hour" : "24-Hour"} Format
        </button>
      </div>

      {/* TIME HEADER */}
      <div className="time-header">
        {[...Array(24).keys()].map(h => (
          <div key={h}>{formatHourLabel(h)}</div>
        ))}
      </div>

      {/* HOURS GRID */}
      <div className="hour-grid">
        {Object.keys(hours).map(h => (
          <input
            key={h}
            type="number"
            min="0"
            max="7"
            value={hours[h]}
            onChange={e =>
              setHours({ ...hours, [h]: Number(e.target.value) })
            }
            style={{
              background: LEGEND[hours[h]]?.color || "#fff"
            }}
          />
        ))}
      </div>

      {/* META ROW */}
      <div className="meta-row">
        <div className="meta-field">
          <label>₹ Spent</label>
          <input
            type="number"
            value={spent}
            onChange={e => setSpent(e.target.value)}
          />
        </div>

        <div className="meta-field">
          <label>Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
        </div>

        <div className="meta-field meta-comment">
          <label>Comment / Highlight</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>
      </div>

      <button onClick={saveDay} style={{ marginTop: 8 }}>
        Save Day
      </button>

      {/* LEGEND */}
      <div className="legend">
        {Object.entries(LEGEND).map(([k, v]) => (
          <div key={k}>
            <span style={{ background: v.color }} />
            {k} – {v.label}
          </div>
        ))}
      </div>
    </div>
  );
}
