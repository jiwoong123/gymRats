import api from "./axios";

export type WeeklySummaryResponse = {
  week_start: string;
  week_end: string;
  totals: {
    workout_days: number;
    sessions: number;
    duration_minutes: number;
    sets: number;
    reps: number;
    volume: number;
  };
  daily_activity: {
    date: string;
    sets: number;
    volume: number;
  }[];
  exercises: {
    exercise_id: number;
    name: string;
    body_part: number;
    sets: number;
    reps: number;
    volume: number;
    max_weight: number;
  }[];
  body_parts: {
    body_part: number;
    sets: number;
    volume: number;
  }[];
};

export async function getWeeklySummary(weekStart?: string) {
  const response = await api.get<WeeklySummaryResponse>("/dashboard/week", {
    params: weekStart ? { week_start: weekStart } : undefined,
  });
  return response.data;
}
