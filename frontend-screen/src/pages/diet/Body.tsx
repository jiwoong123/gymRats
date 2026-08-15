import { useState } from "react";
import { Plus, X, Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import "./Body.css";

const INITIAL_LOGS = [
  { id: "1", date: "2025.07.03", weight: 78.9, fat: 14.2, muscle: 38.1 },
  { id: "2", date: "2025.06.29", weight: 79.2, fat: 14.5, muscle: 37.9 },
  { id: "3", date: "2025.06.22", weight: 79.8, fat: 14.8, muscle: 37.6 },
  { id: "4", date: "2025.06.15", weight: 80.3, fat: 15.1, muscle: 37.4 },
];

type Log = { id: string; date: string; weight: number; fat: number; muscle: number };
type MetricKey = "weight" | "fat" | "muscle" | "bmi";

const USER_HEIGHT_METERS = 1.75;
const METRICS: Record<MetricKey, { label: string; unit: string; color: string }> = {
  weight: { label: "체중", unit: "kg", color: "var(--primary)" },
  fat: { label: "체지방률", unit: "%", color: "var(--streak)" },
  muscle: { label: "골격근량", unit: "kg", color: "var(--chart-2)" },
  bmi: { label: "BMI", unit: "", color: "var(--chart-4)" },
};

export default function Body() {
  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [form, setForm] = useState({ weight: "", fat: "", muscle: "" });
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("weight");

  const latest = logs[0];
  const metric = METRICS[selectedMetric];
  const metricValue = (log: Log, key: MetricKey) =>
    key === "bmi" ? Number((log.weight / USER_HEIGHT_METERS ** 2).toFixed(1)) : log[key];
  const chartData = [...logs]
    .reverse()
    .filter((log) => selectedMetric === "weight" || selectedMetric === "bmi" || metricValue(log, selectedMetric) > 0)
    .map((log) => {
      const [, month, day] = log.date.split(".");
      return { date: `${Number(month)}/${Number(day)}`, value: metricValue(log, selectedMetric) };
    });

  function openAddForm() {
    setEditingId(null);
    setForm({ weight: "", fat: "", muscle: "" });
    setShowForm(true);
  }

  function openEditForm(log: Log) {
    setOpenMenuId(null);
    setEditingId(log.id);
    setForm({
      weight: String(log.weight),
      fat: log.fat > 0 ? String(log.fat) : "",
      muscle: log.muscle > 0 ? String(log.muscle) : "",
    });
    setShowForm(true);
  }

  function deleteLog(log: Log) {
    if (!window.confirm(`${log.date} 신체 기록을 삭제할까요?`)) return;
    setLogs((current) => current.filter((item) => item.id !== log.id));
    setOpenMenuId(null);
    if (editingId === log.id) closeForm();
  }

  function closeForm() {
    setEditingId(null);
    setForm({ weight: "", fat: "", muscle: "" });
    setShowForm(false);
  }

  function saveLog() {
    if (!form.weight) return;
    const values = {
      weight: Number(form.weight),
      fat: Number(form.fat) || 0,
      muscle: Number(form.muscle) || 0,
    };

    if (editingId) {
      setLogs((current) => current.map((log) => log.id === editingId ? { ...log, ...values } : log));
      closeForm();
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
    setLogs((current) => [
      {
        id: Date.now().toString(),
        date: dateStr,
        ...values,
      },
      ...current,
    ]);
    closeForm();
  }

  return (
    <div className="body-page">
      <header className="body-header">
        <div>
          <p className="body-eyebrow">BODY RECORD</p>
          <h1 className="body-title">신체 기록</h1>
        </div>
          <button type="button" className="add-body-btn" aria-label="신체 기록 추가" onClick={openAddForm}>
            <Plus size={18} />
            <span>기록 추가</span>
          </button>
      </header>

      {latest && (
        <section className="body-metrics-chart">
          <div className="metric-cards" aria-label="차트 지표 선택">
            {(Object.keys(METRICS) as MetricKey[]).map((key) => {
              const item = METRICS[key];
              return (
                <button
                  type="button"
                  key={key}
                  className={`metric-card${selectedMetric === key ? " active" : ""}`}
                  aria-pressed={selectedMetric === key}
                  onClick={() => setSelectedMetric(key)}
                  style={ selectedMetric === key? { borderBottomColor: item.color }: undefined}
                >
                  <span className="metric-label">{item.label}</span>
                  <span className="metric-value" style={{ color: item.color }}>
                    {metricValue(latest, key)}<span className="metric-unit">{item.unit}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="body-chart-card">
            <p className="chart-label">{metric.label} 추이{metric.unit && ` (${metric.unit})`}</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart key={selectedMetric} data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="bodyMetricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "'Barlow Condensed'" }} />
                <YAxis axisLine={false} tickLine={false} domain={["auto", "auto"]} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "'JetBrains Mono'" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={metric.color}
                  strokeWidth={2}
                  fill="url(#bodyMetricGradient)"
                  dot={{ fill: metric.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: metric.color }}
                  animationDuration={350}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

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
            <div className="body-log-menu-wrap">
              <button
                type="button"
                className="body-log-menu-trigger"
                aria-label={`${log.date} 기록 메뉴`}
                aria-expanded={openMenuId === log.id}
                onClick={() => setOpenMenuId((current) => current === log.id ? null : log.id)}
              >
                <MoreHorizontal size={17} />
              </button>
              {openMenuId === log.id && (
                <div className="body-log-actions">
                  <button type="button" onClick={() => openEditForm(log)}><Pencil size={14} /> 수정</button>
                  <button type="button" className="delete" onClick={() => deleteLog(log)}><Trash2 size={14} /> 삭제</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="body-overlay">
          <div className="body-form">
            <div className="body-form-header">
              <h3 className="body-form-title">{editingId ? "기록 수정" : "오늘 기록"}</h3>
              <button type="button" className="form-close" aria-label="기록 입력 닫기" onClick={closeForm}><X size={20} /></button>
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
            <button type="button" className="body-save-btn" onClick={saveLog}>
              <Check size={16} /> {editingId ? "수정 저장" : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
