import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, X, Check } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import "./Body.css";

const WEIGHT_DATA = [
  { date: "6/1", weight: 81.2 },
  { date: "6/8", weight: 80.8 },
  { date: "6/15", weight: 80.3 },
  { date: "6/22", weight: 79.8 },
  { date: "6/29", weight: 79.2 },
  { date: "7/3", weight: 78.9 },
];

const INITIAL_LOGS = [
  { id: "1", date: "2025.07.03", weight: 78.9, fat: 14.2, muscle: 38.1 },
  { id: "2", date: "2025.06.29", weight: 79.2, fat: 14.5, muscle: 37.9 },
  { id: "3", date: "2025.06.22", weight: 79.8, fat: 14.8, muscle: 37.6 },
  { id: "4", date: "2025.06.15", weight: 80.3, fat: 15.1, muscle: 37.4 },
];

type Log = { id: string; date: string; weight: number; fat: number; muscle: number };

export default function Body() {
  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight: "", fat: "", muscle: "" });

  const latest = logs[0];
  const prev = logs[1];
  const weightDiff = latest && prev ? (latest.weight - prev.weight).toFixed(1) : "0";
  const weightDown = Number(weightDiff) < 0;

  function addLog() {
    if (!form.weight) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
    setLogs([
      {
        id: Date.now().toString(),
        date: dateStr,
        weight: Number(form.weight),
        fat: Number(form.fat) || 0,
        muscle: Number(form.muscle) || 0,
      },
      ...logs,
    ]);
    setForm({ weight: "", fat: "", muscle: "" });
    setShowForm(false);
  }

  return (
    <div className="body-page">
      {/* Header */}
      <div className="body-header">
        <div>
          <h2 className="body-title">체성분 기록</h2>
          {latest && (
            <div className="body-current">
              <span className="body-weight">{latest.weight}<span>kg</span></span>
              <span className={"body-diff" + (weightDown ? " down" : " up")}>
                {weightDown ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                {Math.abs(Number(weightDiff))}kg
              </span>
            </div>
          )}
        </div>
        <button className="add-body-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} />
        </button>
      </div>

      {/* Metrics */}
      {latest && (
        <div className="metric-cards">
          {[
            { label: "체지방률", value: latest.fat, unit: "%", color: "#ff6b35" },
            { label: "골격근량", value: latest.muscle, unit: "kg", color: "#00e5ff" },
            { label: "BMI", value: (latest.weight / (1.75 * 1.75)).toFixed(1), unit: "", color: "#a855f7" },
          ].map((m) => (
            <div key={m.label} className="metric-card">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value" style={{ color: m.color }}>
                {m.value}<span className="metric-unit">{m.unit}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Weight chart */}
      <div className="body-chart-card">
        <p className="chart-label">체중 추이 (kg)</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={WEIGHT_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7070a0", fontSize: 10, fontFamily: "'Barlow Condensed'" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              tick={{ fill: "#7070a0", fontSize: 10, fontFamily: "'JetBrains Mono'" }}
            />
           
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#00e5ff"
              strokeWidth={2}
              fill="url(#wGrad)"
              dot={{ fill: "#00e5ff", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#00e5ff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Log list */}
      <div className="body-logs">
        {logs.map((log) => (
          <div key={log.id} className="body-log-item">
            <span className="log-date">{log.date}</span>
            <div className="log-values">
              <span className="log-val weight">{log.weight}kg</span>
              {log.fat > 0 && <span className="log-val fat">{log.fat}%</span>}
              {log.muscle > 0 && <span className="log-val muscle">{log.muscle}kg</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="body-overlay">
          <div className="body-form">
            <div className="body-form-header">
              <h3 className="body-form-title">오늘 기록</h3>
              <button className="form-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            {[
              { field: "weight", label: "체중 (kg)", placeholder: "78.5" },
              { field: "fat", label: "체지방률 (%)", placeholder: "14.2" },
              { field: "muscle", label: "골격근량 (kg)", placeholder: "38.0" },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="body-form-group">
                <label className="body-form-label">{label}</label>
                <input
                  className="body-form-input"
                  type="number"
                  step="0.1"
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
            <button className="body-save-btn" onClick={addLog}>
              <Check size={16} /> 저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
