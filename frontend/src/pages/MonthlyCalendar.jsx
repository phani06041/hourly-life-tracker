import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MonthlyCalendar() {
  const [days, setDays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5001/api/day?year=2026&month=01")
      .then(r => r.json())
      .then(setDays);
  }, []);

  return (
    <div className="calendar">
      {days.map(d => (
        <div
          key={d.date}
          className="calendar-day"
          onClick={() => navigate(`/daily?date=${d.date}`)}
        >
          {d.date.split("-")[2]}
        </div>
      ))}
    </div>
  );
}
