import axios from "axios";
import api from "./axios";

export type SessionSet = { weight: number | null; reps: number | null; completed: boolean };
export type SessionExercise = {
  exercise_id: number;
  name_kr: string;
  body_part: number;
  rest_seconds: number;
  sets: SessionSet[];
};
export type WorkoutSession = {
  id: number;
  routine_id: number | null;
  routine_name: string | null;
  started_at: string;
  exercises: SessionExercise[];
};
export type SessionHistoryItem = {
  id: number;
  performed_at: string;
  name: string;
  exercise_names: string[];
  duration: number;
  volume: number;
};
export type SessionHistoryPage = { items: SessionHistoryItem[]; next_offset: number | null };
export type WorkoutCalendarDay = { date: string; body_parts: number[] };
export type SessionDetailSet = {
  set_number: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  is_warmup: boolean;
  volume: number;
};
export type SessionDetailExercise = {
  exercise_id: number;
  name_kr: string;
  body_part: number;
  rest_seconds: number;
  completed_sets: number;
  volume: number;
  sets: SessionDetailSet[];
};
export type SessionDetail = {
  id: number;
  name: string;
  routine_name: string | null;
  performed_at: string;
  ended_at: string;
  duration: number;
  volume: number;
  completed_sets: number;
  memo: string | null;
  exercises: SessionDetailExercise[];
};

export async function getActiveWorkoutSession() {
  const response = await api.get<WorkoutSession | null>("/workout-sessions/active");
  return response.data;
}

export async function startWorkoutSession(routineId: number | null) {
  try {
    const response = await api.post<WorkoutSession>("/workout-sessions", { routine_id: routineId });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const activeSession = await getActiveWorkoutSession();
      if (activeSession) return activeSession;
    }
    throw error;
  }
}

export async function finishWorkoutSession(
  id: number,
  exercises: SessionExercise[],
  name: string | null,
  memo: string | null,
  elapsedSeconds: number,
) {
  const response = await api.put(`/workout-sessions/${id}/finish`, {
    exercises,
    name,
    memo,
    elapsed_seconds: elapsedSeconds,
  });
  return response.data;
}

export async function getWorkoutHistory(offset: number, limit = 10) {
  const response = await api.get<SessionHistoryPage>("/workout-sessions/history", { params: { offset, limit } });
  return response.data;
}

export async function getWorkoutCalendar(month: string) {
  const response = await api.get<WorkoutCalendarDay[]>("/workout-sessions/calendar", { params: { month } });
  return response.data;
}

export async function getWorkoutSessionDetail(id: number) {
  const response = await api.get<SessionDetail>(`/workout-sessions/${id}`);
  return response.data;
}

export async function deleteWorkoutSession(id: number) {
  await api.delete(`/workout-sessions/${id}`);
}
