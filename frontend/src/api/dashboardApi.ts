import api from "./axios";

export interface HomeResponse {
  user: {
    nickname: string;
  };

  streak: number;

  weekly_summary: {
    workout_days: number;
    volume: number;
    sets: number;
  };

  weekly_activity: {
    day: string;
    volume: number;
  }[];

  quick_workouts: {
    routine_id: number;
    name: string;
  }[];

  recent_workouts: {
    id: number;
    name: string;
    performed_at: string;
    duration: number;
    volume: number;
  }[];

  latest_pr: {
    exercise: string;
    weight: number;
  } | null;
}

export async function getHome() {
  const response = await api.get<HomeResponse>("/dashboard/home");
  return response.data;
}
