import api from "./axios";

export type PersonalRecordHistoryItem = {
  id: number;
  exercise_id: number;
  exercise: string;
  record_type: 1 | 2 | 3;
  value: number;
  achieved_at: string;
};

export type PersonalRecordHistoryPage = {
  items: PersonalRecordHistoryItem[];
  next_offset: number | null;
};

export type PersonalRecordExerciseSummary = {
  exercise_id: number;
  exercise: string;
  best_weight: number | null;
  best_volume: number | null;
  best_estimated_1rm: number | null;
  record_count: number;
  latest_achieved_at: string;
};

export type PersonalRecordExerciseDetail = {
  exercise_id: number;
  exercise: string;
  best_weight: number | null;
  best_volume: number | null;
  best_estimated_1rm: number | null;
  items: PersonalRecordHistoryItem[];
};

export async function getPersonalRecordHistory(offset: number, limit = 20) {
  const response = await api.get<PersonalRecordHistoryPage>("/personal-records/history", {
    params: { offset, limit },
  });
  return response.data;
}

export async function getPersonalRecordExercises() {
  const response = await api.get<PersonalRecordExerciseSummary[]>("/personal-records/exercises");
  return response.data;
}

export async function getPersonalRecordExercise(exerciseId: number) {
  const response = await api.get<PersonalRecordExerciseDetail>(`/personal-records/exercises/${exerciseId}`);
  return response.data;
}
