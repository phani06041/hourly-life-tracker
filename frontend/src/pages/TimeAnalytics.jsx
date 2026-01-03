import { useEffect, useRef, useState } from "react";
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

/* ---------- CONSTANTS ---------- */

const LEGEND = {
  1: { label: "Sleep", color: "#4f6ef7" },
  2: { label: "Travel", color: "#17a2b8" },
  3: { label: "Work", color: "#28a745" },
  4: { label: "Chores", color: "#f7b500" },
  5: { label: "Exercise", color: "#ff4d4f" },
  6: { label: "Leisure", color: "#8e6df7" },
  7: { label: "Misc / Prep", color: "#6c757d" }
};

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, "0");

/* Long scrollable year list */
const YEARS = [];
for (let y = CURRENT_YEAR + 20; y >= 1800; y--) YEARS.push(y);

/* ---------- COMPONENT ---------- */

export default function TimeAnalytics() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* ---------- MODE ---------- */
  const [mode, setMode] = useState("monthly"); // monthly | yearly | lifetime | range

  /* ---------- YEAR ---------- */
  const [year, setYear] = useState(CURRENT_YEAR);
  const [yearInput, setYearInput] = useState(String(CURRENT_YEAR));
  const [yearOpen, setYearOpen] = useState(false);

  /* ---------- MONTH ---------- */
  const [month, setMonth] = useState(CURRENT_MONTH);

  /* ---------- RANGE ---------- */
  const [from, setFrom] = useState("2024-01");
  const [to, setTo] = useState(`${CURRENT_YEAR}-12`);

  /* ---------- DATA ---------- */
  const [distribution, setDistribution] = useState({});

  /* ---------- CLOSE DROPDOWN ---------- */
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setYearOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ---------- FETCH DATA (DB CONNECTION POINT) ---------- */
  useEffect(() => {
    fetchDistribution();
  }, [mode, year, month, from, to]);

  const fetchDistribution = async () => {
    try {
      let url = "";

      if (mode === "monthly") {
        url = `http://localhost:5001/api/analytics/distribution?type=monthly&year=${year}&month=${month}`;
      } else if (mode === "yearly") {
        url = `http://localhost:5001/api/analytics/distribution?type=yearly&year=${year}`;
      } else if (mode === "lifetime") {
        url = `http://localhost:5001/api/analytics/distribution?type=lifetime`;
      } else if (mode === "range") {
        url = `http://localhost:5001/api/analytics/distribution?type=range&from=${from}&to=${to}`;
      }

      const res = await axios.get(url);
      setDistribution(res.data || {});
    } catch (err) {
      console.error("Time analytics fetch error", err);
      setDistribution({});
    }
  };

  /* ---------- CHART DATA ---------- */

  const labels = Object.keys(distribution);
  const values = Object.values(distribution);
  const total = values.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (l) =>
            Object.values(LEGEND).find((x) => x.label === l)?.color || "#ccc"
        ),
        borderWidth: 2,
        borderColor: "#fff"
      }
    ]
  };

  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const hrs = ctx.raw;
            const pct = total ? ((hrs / total) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${hrs}h (${pct}%)`;
          }
        }
      }
    }
  };

  /* ---------- FILTER YEARS ---------- */
  const filteredYears = YEARS.filter((y) =>
    String(y).startsWith(yearInput)
  ).slice(0, 40);

  /* ---------- UI ---------- */

  return (
    <div className="container">
      <h1>Time Analytics</h1>
      <button onClick={() => navigate("/")}>← Back</button>

      {/* MODE SWITCH */}
      <div style={{ marginTop: 20 }}>
        {["monthly", "yearly", "lifetime", "range"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              marginRight: 10,
              background: mode === m ? "#4f6ef7" : "#ddd",
              color: mode === m ? "#fff" : "#000",
              padding: "6px 14px",
              borderRadius: 6,
              border: "none"
            }}
          >
            {m === "monthly"
              ? "Monthly"
              : m === "yearly"
              ? "Yearly"
              : m === "lifetime"
              ? "Lifetime"
              : "Custom Range"}
          </button>
        ))}
      </div>

      {/* YEAR FILTER */}
      {(mode === "monthly" || mode === "yearly") && (
        <div
          ref={dropdownRef}
          style={{ marginTop: 15, position: "relative", display: "inline-block" }}
        >
          <strong>Year:</strong>
          <input
            value={yearInput}
            onFocus={() => setYearOpen(true)}
            onChange={(e) => setYearInput(e.target.value)}
            onBlur={() => {
              const v = Number(yearInput);
              if (!isNaN(v) && v >= 1800) setYear(v);
              else setYearInput(String(year));
            }}
            style={{
              marginLeft: 8,
              padding: 6,
              width: 110,
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />

          {yearOpen && (
            <div
              style={{
                position: "absolute",
                top: 38,
                left: 48,
                width: 110,
                maxHeight: 240,
                overflowY: "auto",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                zIndex: 1000
              }}
            >
              {filteredYears.map((y) => (
                <div
                  key={y}
                  onClick={() => {
                    setYear(y);
                    setYearInput(String(y));
                    setYearOpen(false);
                  }}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    background: y === year ? "#eef2ff" : "#fff"
                  }}
                >
                  {y}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MONTH FILTER */}
      {mode === "monthly" && (
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ marginLeft: 10, padding: 6 }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            return <option key={m}>{m}</option>;
          })}
        </select>
      )}

      {/* RANGE FILTER */}
      {mode === "range" && (
        <div style={{ marginTop: 15, display: "flex", gap: 12 }}>
          <div>
            <label>From</label>
            <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label>To</label>
            <input type="month" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      )}

      {/* CHART + BREAKDOWN */}
      {labels.length > 0 ? (
        <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
          <div style={{ position: "relative", width: 300 }}>
            <Doughnut data={chartData} options={chartOptions} />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 24, fontWeight: "bold" }}>{total}h</div>
              <div style={{ fontSize: 12, color: "#666" }}>Total Tracked</div>
            </div>
          </div>

          <div>
            {labels.map((l, i) => {
              const hrs = values[i];
              const pct = total ? ((hrs / total) * 100).toFixed(1) : 0;
              const color =
                Object.values(LEGEND).find((x) => x.label === l)?.color || "#ccc";

              return (
                <div key={l} style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: color,
                      display: "inline-block",
                      marginRight: 8
                    }}
                  />
                  <strong>{l}</strong> — {hrs}h ({pct}%)
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 40 }}>No data available.</p>
      )}
    </div>
  );
}
