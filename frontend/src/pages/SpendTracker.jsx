import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ExportButton from "../components/ExportButton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

/* ---------- CONSTANTS ---------- */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const CURRENT_YEAR = new Date().getFullYear();

/* Large scrollable year list */
const YEARS = [];
for (let y = CURRENT_YEAR + 20; y >= 1800; y--) YEARS.push(y);

/* ---------- COMPONENT ---------- */

export default function SpendTracker() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* ---------- MODE ---------- */
  const [mode, setMode] = useState("yearly"); // yearly | lifetime | range

  /* ---------- YEAR ---------- */
  const [year, setYear] = useState(CURRENT_YEAR);
  const [yearInput, setYearInput] = useState(String(CURRENT_YEAR));
  const [yearOpen, setYearOpen] = useState(false);

  /* ---------- RANGE ---------- */
  const [from, setFrom] = useState("2024-01");
  const [to, setTo] = useState(`${CURRENT_YEAR}-12`);

  /* ---------- DATA ---------- */
  const [spendData, setSpendData] = useState({});

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
    fetchSpend();
  }, [mode, year, from, to]);

  const fetchSpend = async () => {
    try {
      let url = "";

      if (mode === "lifetime") {
        url = "http://localhost:5001/api/analytics/spend?type=lifetime";
      } else if (mode === "range") {
        url = `http://localhost:5001/api/analytics/spend?type=range&from=${from}&to=${to}`;
      } else {
        url = `http://localhost:5001/api/analytics/spend?year=${year}`;
      }

      const res = await axios.get(url);
      setSpendData(res.data || {});
    } catch (err) {
      console.error("Spend fetch error", err);
      setSpendData({});
    }
  };

  /* ---------- NORMALIZATION (KEY FIX) ---------- */

  let labels = [];
  let values = [];

  /* YEARLY → fixed 12 months */
  if (mode === "yearly") {
    labels = MONTHS;

    values = MONTHS.map((_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      return spendData[key] || 0;
    });
  }

  /* LIFETIME / RANGE → dynamic months */
  else {
    const entries = Object.entries(spendData)
      .map(([month, value]) => ({ month, value }))
      .sort((a, b) => a.month.localeCompare(b.month));

    labels = entries.map(e => e.month);
    values = entries.map(e => e.value);
  }

  /* ---------- STATS ---------- */

  const nonZeroMonths = values.filter(v => v > 0);
  const total = values.reduce((a, b) => a + b, 0);

  const avg =
    nonZeroMonths.length > 0
      ? nonZeroMonths.reduce((a, b) => a + b, 0) / nonZeroMonths.length
      : 0;

  const maxValue = values.length ? Math.max(...values) : 0;
  const minValue = values.length ? Math.min(...values) : 0;

  const maxIndex = values.indexOf(maxValue);
  const minIndex = values.indexOf(minValue);

  const maxMonth = labels[maxIndex];
  const minMonth = labels[minIndex];

  /* ---------- CHART ---------- */

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spend (₹)",
        data: values,
        backgroundColor: "#4f6ef7",
        borderRadius: 8,
        maxBarThickness: 42
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹ ${ctx.raw}`
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `₹ ${v}` }
      }
    }
  };

  /* ---------- YEAR FILTER ---------- */
  const filteredYears = YEARS.filter((y) =>
    String(y).startsWith(yearInput)
  ).slice(0, 40);

  /* ---------- UI ---------- */

  return (
    <div className="container">
      <h1>Spend Tracker</h1>
      <button onClick={() => navigate("/")}>← Back</button>
<ExportButton
  url={`http://localhost:5001/api/export/spend?type=${mode}&year=${year}&from=${from}&to=${to}`}
/>

      {/* MODE SWITCH */}
      <div style={{ marginTop: 20 }}>
        {["yearly", "lifetime", "range"].map((m) => (
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
            {m === "yearly"
              ? "Yearly"
              : m === "lifetime"
              ? "Lifetime"
              : "Custom Range"}
          </button>
        ))}
      </div>

      {/* YEAR FILTER */}
      {mode === "yearly" && (
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

      {/* MAIN CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 30,
          marginTop: 30
        }}
      >
        <Bar data={chartData} options={chartOptions} />

        <div>
          <h3>Summary</h3>

          {labels.map((m, i) => (
            <div
              key={m}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px dashed #eee"
              }}
            >
              <span>{m}</span>
              <strong>₹ {values[i]}</strong>
            </div>
          ))}

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12
            }}
          >
            <Stat label="Highest" value={`₹ ${maxValue}`} note={maxMonth} />
            <Stat label="Lowest" value={`₹ ${minValue}`} note={minMonth} />
            <Stat
              label="Average"
              value={`₹ ${avg.toFixed(2)}`}
              note={`${nonZeroMonths.length} active months`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SMALL COMPONENT ---------- */

function Stat({ label, value, note }) {
  return (
    <div
      style={{
        background: "#f8f9ff",
        padding: 12,
        borderRadius: 10,
        textAlign: "center"
      }}
    >
      <small style={{ color: "#777" }}>{label}</small>
      <strong style={{ display: "block", fontSize: 18 }}>{value}</strong>
      {note && <div style={{ fontSize: 12 }}>{note}</div>}
    </div>
  );
}
