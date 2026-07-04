import { useState } from "react";
import { Plus, X, Check, ChevronDown, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie} from "recharts";
import "./Diet.css";

type Food = { id: string; name: string; kcal: number; protein: number; carb: number; fat: number; amount: number };
type Meal = "아침" | "점심" | "저녁" | "간식";

const MEAL_KEYS: Meal[] = ["아침", "점심", "저녁", "간식"];

const FOOD_DB: Omit<Food, "id" | "amount">[] = [
  { name: "닭가슴살 (100g)", kcal: 165, protein: 31, carb: 0, fat: 3.6 },
  { name: "현미밥 (200g)", kcal: 294, protein: 5.4, carb: 64, fat: 1.2 },
  { name: "달걀 1개", kcal: 78, protein: 6.3, carb: 0.6, fat: 5.3 },
  { name: "그릭요거트 (150g)", kcal: 130, protein: 17, carb: 7, fat: 3.5 },
  { name: "고구마 (150g)", kcal: 129, protein: 2.4, carb: 30, fat: 0.1 },
  { name: "연어 (100g)", kcal: 208, protein: 20, carb: 0, fat: 13 },
  { name: "오트밀 (50g)", kcal: 189, protein: 6.5, carb: 32, fat: 3.5 },
  { name: "아몬드 (30g)", kcal: 174, protein: 6.3, carb: 6.1, fat: 15 },
  { name: "바나나 1개", kcal: 89, protein: 1.1, carb: 23, fat: 0.3 },
  { name: "프로틴 쉐이크", kcal: 120, protein: 25, carb: 3, fat: 1.5 },
  { name: "두부 (150g)", kcal: 120, protein: 13, carb: 2.4, fat: 7 },
  { name: "소고기 (100g)", kcal: 250, protein: 26, carb: 0, fat: 15 },
];

const GOALS = { kcal: 2400, protein: 180, carb: 240, fat: 65 };

function uid() { return Math.random().toString(36).slice(2, 9); }

const INITIAL_MEALS: Record<Meal, Food[]> = {
  아침: [
    { id: uid(), name: "달걀 1개", kcal: 78, protein: 6.3, carb: 0.6, fat: 5.3, amount: 2 },
    { id: uid(), name: "오트밀 (50g)", kcal: 189, protein: 6.5, carb: 32, fat: 3.5, amount: 1 },
  ],
  점심: [
    { id: uid(), name: "닭가슴살 (100g)", kcal: 165, protein: 31, carb: 0, fat: 3.6, amount: 1 },
    { id: uid(), name: "현미밥 (200g)", kcal: 294, protein: 5.4, carb: 64, fat: 1.2, amount: 1 },
  ],
  저녁: [],
  간식: [
    { id: uid(), name: "프로틴 쉐이크", kcal: 120, protein: 25, carb: 3, fat: 1.5, amount: 1 },
  ],
};

const MACRO_COLORS = {
  protein: "#c8ff00",
  carb: "#00e5ff",
  fat: "#ff6b35",
};

export default function Diet() {
  const [meals, setMeals] = useState<Record<Meal, Food[]>>(INITIAL_MEALS);
  const [addingTo, setAddingTo] = useState<Meal | null>(null);
  const [search, setSearch] = useState("");
  const [expandedMeal, setExpandedMeal] = useState<Meal | null>("아침");

  const allFoods = Object.values(meals).flat();

  const totals = allFoods.reduce(
    (acc, f) => ({
      kcal: acc.kcal + f.kcal * f.amount,
      protein: acc.protein + f.protein * f.amount,
      carb: acc.carb + f.carb * f.amount,
      fat: acc.fat + f.fat * f.amount,
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 }
  );

  function addFood(meal: Meal, food: Omit<Food, "id" | "amount">) {
    setMeals((m) => ({
      ...m,
      [meal]: [...m[meal], { ...food, id: uid(), amount: 1 }],
    }));
    setAddingTo(null);
    setSearch("");
  }

  function removeFood(meal: Meal, id: string) {
    setMeals((m) => ({ ...m, [meal]: m[meal].filter((f) => f.id !== id) }));
  }

  const filtered = FOOD_DB.filter(
    (f) => f.name.toLowerCase().includes(search) || search === ""
  );

  const macroTotal = totals.protein + totals.carb + totals.fat;
  const pieData = [
    { name: "단백질", value: Math.round(totals.protein), color: MACRO_COLORS.protein },
    { name: "탄수화물", value: Math.round(totals.carb), color: MACRO_COLORS.carb },
    { name: "지방", value: Math.round(totals.fat), color: MACRO_COLORS.fat },
  ];

  const proteinPct = Math.min((totals.protein / GOALS.protein) * 100, 100);
  const kcalPct = Math.min((totals.kcal / GOALS.kcal) * 100, 100);

  return (
    <div className="diet-page">
      {/* Calorie ring + summary */}
      <div className="diet-hero">
        <div className="kcal-ring-wrap">
          <ResponsiveContainer width={130} height={130}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={60}
              startAngle={90}
              endAngle={-270}
              data={[{ value: kcalPct, fill: "#c8ff00" }]}
            >
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "rgba(255,255,255,0.06)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="kcal-center">
            <span className="kcal-num">{Math.round(totals.kcal)}</span>
            <span className="kcal-unit">kcal</span>
          </div>
        </div>

        <div className="kcal-right">
          <div className="kcal-goal-row">
            <span className="kcal-goal-label">목표</span>
            <span className="kcal-goal-val">{GOALS.kcal} kcal</span>
          </div>
          <div className="kcal-goal-row">
            <span className="kcal-goal-label">남은 칼로리</span>
            <span className="kcal-goal-val remain">{Math.max(0, GOALS.kcal - Math.round(totals.kcal))} kcal</span>
          </div>

          <div className="macro-mini-list">
            {[
              { label: "단백질", val: totals.protein, goal: GOALS.protein, color: MACRO_COLORS.protein },
              { label: "탄수화물", val: totals.carb, goal: GOALS.carb, color: MACRO_COLORS.carb },
              { label: "지방", val: totals.fat, goal: GOALS.fat, color: MACRO_COLORS.fat },
            ].map((m) => (
              <div key={m.label} className="macro-mini">
                <span className="macro-mini-label">{m.label}</span>
                <div className="macro-mini-bar-bg">
                  <div
                    className="macro-mini-bar-fill"
                    style={{
                      width: `${Math.min((m.val / m.goal) * 100, 100)}%`,
                      background: m.color,
                    }}
                  />
                </div>
                <span className="macro-mini-val" style={{ color: m.color }}>
                  {Math.round(m.val)}g
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protein focus card */}
      <div className="protein-card">
        <div className="protein-left">
          <div className="protein-icon"><Beef size={18} /></div>
          <div>
            <p className="protein-title">단백질 목표</p>
            <p className="protein-sub">체중 1kg당 2.2g 기준</p>
          </div>
        </div>
        <div className="protein-right">
          <span className="protein-current">{Math.round(totals.protein)}</span>
          <span className="protein-goal">/ {GOALS.protein}g</span>
        </div>
        <div className="protein-bar-wrap">
          <div className="protein-bar-bg">
            <div className="protein-bar-fill" style={{ width: `${proteinPct}%` }} />
          </div>
          <span className="protein-pct">{Math.round(proteinPct)}%</span>
        </div>
      </div>

      {/* Macro balance pie */}
      <div className="macro-balance-card">
        <p className="card-section-label">영양 균형</p>
        <div className="macro-balance-inner">
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={3}
                fill="color"
                />
             
            </PieChart>
          </ResponsiveContainer>
          <div className="macro-legend">
            {pieData.map((d) => (
              <div key={d.name} className="macro-legend-item">
                <span className="legend-dot" style={{ background: d.color }} />
                <span className="legend-name">{d.name}</span>
                <span className="legend-val">{d.value}g</span>
                <span className="legend-pct">
                  {macroTotal > 0 ? Math.round((d.value / macroTotal) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="meals-section">
        <p className="card-section-label">식사 기록</p>
        {MEAL_KEYS.map((meal) => {
          const mealFoods = meals[meal];
          const mealKcal = mealFoods.reduce((a, f) => a + f.kcal * f.amount, 0);
          const mealProtein = mealFoods.reduce((a, f) => a + f.protein * f.amount, 0);
          const isOpen = expandedMeal === meal;

          return (
            <div key={meal} className="meal-card">
              <button
                className="meal-header"
                onClick={() => setExpandedMeal(isOpen ? null : meal)}
              >
                <div className="meal-header-left">
                  <span className="meal-icon">{mealIcon(meal)}</span>
                  <span className="meal-name">{meal}</span>
                  {mealFoods.length > 0 && (
                    <span className="meal-count">{mealFoods.length}가지</span>
                  )}
                </div>
                <div className="meal-header-right">
                  <span className="meal-kcal">{Math.round(mealKcal)} kcal</span>
                  <ChevronDown size={15} className={"meal-chevron" + (isOpen ? " open" : "")} />
                </div>
              </button>

              {isOpen && (
                <div className="meal-body">
                  {mealFoods.length === 0 && (
                    <p className="meal-empty">아직 기록이 없어요</p>
                  )}
                  {mealFoods.map((food) => (
                    <div key={food.id} className="food-row">
                      <div className="food-info">
                        <span className="food-name">{food.name}</span>
                        <span className="food-macros">
                          P {Math.round(food.protein * food.amount)}g · C {Math.round(food.carb * food.amount)}g · F {Math.round(food.fat * food.amount)}g
                        </span>
                      </div>
                      <span className="food-kcal">{Math.round(food.kcal * food.amount)}</span>
                      <button className="food-remove" onClick={() => removeFood(meal, food.id)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="add-food-btn"
                    onClick={() => { setAddingTo(meal); setSearch(""); }}
                  >
                    <Plus size={15} /> 음식 추가
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Food picker sheet */}
      {addingTo && (
        <div className="food-overlay" onClick={() => setAddingTo(null)}>
          <div className="food-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="food-sheet-header">
              <h3 className="food-sheet-title">{addingTo} 추가</h3>
              <button className="sheet-close" onClick={() => setAddingTo(null)}><X size={20} /></button>
            </div>
            <input
              className="food-search"
              type="text"
              placeholder="음식 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="food-db-list">
              {filtered.map((food) => (
                <button
                  key={food.name}
                  className="food-db-item"
                  onClick={() => addFood(addingTo, food)}
                >
                  <div className="food-db-info">
                    <span className="food-db-name">{food.name}</span>
                    <span className="food-db-macros">
                      단백질 {food.protein}g · 탄수 {food.carb}g · 지방 {food.fat}g
                    </span>
                  </div>
                  <div className="food-db-right">
                    <span className="food-db-kcal">{food.kcal}</span>
                    <span className="food-db-unit">kcal</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mealIcon(meal: Meal) {
  return { 아침: "🌅", 점심: "☀️", 저녁: "🌙", 간식: "🍎" }[meal];
}
