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

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = String(now.getMonth() + 1).padStart(2, "0");

/* Build long year list */
const YEARS = [];
for (let y = CURRENT_YEAR + 20; y >= 1800; y--) YEARS.push(y);

/* ---------- COMPONENT ---------- */

export default function TimeAnalytics() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [mode, setMode] = useState("monthly");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [distribution, setDistribution] = useState({});

  const [yearOpen, setYearOpen] = useState(false);
  const [yearInput, setYearInput] = useState(String(CURRENT_YEAR));

  /* ---------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setYearOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    fetchDistribution();
  }, [mode, year, month]);

  const fetchDistribution = async () => {
    try {
      const params =
        mode === "monthly"
          ? `type=monthly&year=${year}&month=${month}`
          : `type=yearly&year=${year}`;

      const res = await axios.get(
        `http://localhost:5001/api/analytics/distribution?${params}`
      );

      setDistribution(res.data || {});
    } catch {
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
  ).slice(0, 30); // limit render for performance

  /* ---------- UI ---------- */

  return (
    <div className="container">
      <h1>Time Analytics</h1>
      <button onClick={() => navigate("/")}>← Back</button>

      {/* MODE */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setMode("monthly")}
          style={{
            marginRight: 10,
            background: mode === "monthly" ? "#4f6ef7" : "#ccc"
          }}
        >
          Monthly
        </button>

        <button
          onClick={() => setMode("yearly")}
          style={{
            background: mode === "yearly" ? "#4f6ef7" : "#ccc"
          }}
        >
          Yearly
        </button>
      </div>

      {/* FILTERS */}
      <div
        style={{ marginTop: 15, display: "flex", alignItems: "center", gap: 10 }}
        ref={dropdownRef}
      >
        <strong>Year:</strong>

        {/* SINGLE INPUT */}
        <input
          value={yearInput}
          onFocus={() => setYearOpen(true)}
          onChange={(e) => {
            setYearInput(e.target.value);
            const v = Number(e.target.value);
            if (!isNaN(v)) setYear(v);
          }}
          style={{
            width: 120,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />

        {/* SCROLLABLE DROPDOWN */}
        {yearOpen && (
          <div
            style={{
              position: "absolute",
              marginTop: 140,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 8,
              maxHeight: 240,
              width: 120,
              overflowY: "auto",
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

        {/* MONTH */}
        {mode === "monthly" && (
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: 6 }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, "0");
              return <option key={m}>{m}</option>;
            })}
          </select>
        )}
      </div>

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
