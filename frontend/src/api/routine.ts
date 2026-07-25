import api from "./axios";

export type RoutineExercise = {
  id: number;
  name_kr: string;
  name_eng: string;
  body_part: number;
};

export type CreatedRoutine = {
  id: number;
  name: string;
  exercise_count: number;
};

export async function getRoutineExercises() {
  const response = await api.get<RoutineExercise[]>("/routines/exercises");
  return response.data;
}

export async function createRoutine(name: string, exerciseIds: number[]) {
  const response = await api.post<CreatedRoutine>("/routines", {
    name,
    exercise_ids: exerciseIds,
  });
  return response.data;
}
