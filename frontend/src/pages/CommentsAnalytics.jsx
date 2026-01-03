import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExportButton from "../components/ExportButton";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, "0");

export default function CommentsHighlights() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("monthly"); // monthly | yearly | lifetime | range
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [from, setFrom] = useState("2024-01");
  const [to, setTo] = useState(`${CURRENT_YEAR}-12`);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, [mode, year, month, from, to]);

  const fetchComments = async () => {
    try {
      let url = "";

      if (mode === "monthly") {
        url = `/api/analytics/comments?type=monthly&year=${year}&month=${month}`;
      } else if (mode === "yearly") {
        url = `/api/analytics/comments?type=yearly&year=${year}`;
      } else if (mode === "range") {
        url = `/api/analytics/comments?type=range&from=${from}&to=${to}`;
      } else {
        url = `/api/analytics/comments?type=lifetime`;
      }

      const res = await axios.get(`http://localhost:5001${url}`);
      setComments(res.data || []);
    } catch {
      setComments([]);
    }
  };

  return (
    <div className="container">
      <h1>Comments & Highlights</h1>
      <button onClick={() => navigate("/")}>← Back</button>
<ExportButton
  url={`http://localhost:5001/api/export/comments?type=${mode}&year=${year}&month=${month}&from=${from}&to=${to}`}
/>

      {/* MODE SWITCH */}
      <div style={{ marginTop: 20 }}>
        {["monthly", "yearly", "lifetime", "range"].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              marginRight: 10,
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: mode === m ? "#4f6ef7" : "#ddd",
              color: mode === m ? "#fff" : "#000"
            }}
          >
            {m === "monthly" ? "Monthly"
              : m === "yearly" ? "Yearly"
              : m === "lifetime" ? "Lifetime"
              : "Custom Range"}
          </button>
        ))}
      </div>

      {/* FILTER ROW */}
      <div style={{ marginTop: 15, display: "flex", gap: 12, alignItems: "center" }}>
        {(mode === "monthly" || mode === "yearly") && (
          <>
            <strong>Year:</strong>
            <input
              value={year}
              onChange={e => setYear(e.target.value)}
              style={{ padding: 6, width: 90 }}
            />
          </>
        )}

        {mode === "monthly" && (
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, "0");
              return <option key={m}>{m}</option>;
            })}
          </select>
        )}

        {mode === "range" && (
          <>
            <label>From</label>
            <input type="month" value={from} onChange={e => setFrom(e.target.value)} />
            <label>To</label>
            <input type="month" value={to} onChange={e => setTo(e.target.value)} />
          </>
        )}
      </div>

      {/* COMMENTS LIST */}
      <div style={{ marginTop: 30 }}>
        {comments.length === 0 ? (
          <p>No comments available.</p>
        ) : (
          comments.map(c => (
            <div
              key={c.date}
              style={{
                background: "#f8f9ff",
                padding: 14,
                borderRadius: 10,
                marginBottom: 12
              }}
            >
              <strong>{c.date}</strong>
              <div style={{ marginTop: 6 }}>{c.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
