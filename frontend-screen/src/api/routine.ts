import api from "./axios";
import type { RoutineIconName } from "../components/RoutineIcon";

export type RoutineExercise = {
  id: number;
  name_kr: string;
  name_eng: string;
  body_part: number;
  default_weight: number | null;
};

export type RoutineSet = {
  id?: number;
  set_number: number;
  target_weight: number | null;
  target_reps: number | null;
  target_duration: number | null;
  target_distance: number | null;
  rest_seconds: number | null;
  is_warmup: boolean;
  is_failure: boolean;
  is_drop_set: boolean;
  is_super_set: boolean;
};

export type SelectedRoutineExercise = RoutineExercise & {
  rest_seconds: number | null;
  sets: RoutineSet[];
};

export type CreatedRoutine = {
  id: number;
  name: string;
  exercise_count: number;
};

export type Routine = {
  id: number;
  name: string;
  icon: RoutineIconName;
  exercises: SelectedRoutineExercise[];
};

export async function getRoutineExercises() {
  const response = await api.get<RoutineExercise[]>("/routines/exercises");
  return response.data;
}

function routinePayload(name: string, exercises: SelectedRoutineExercise[]) {
  return {
    name,
    exercise_ids: exercises.map((exercise) => exercise.id),
    exercise_settings: exercises.map((exercise) => ({
      exercise_id: exercise.id,
      rest_seconds: exercise.rest_seconds,
      sets: exercise.sets.map((routineSet, index) => ({
        set_number: index + 1,
        target_weight: routineSet.target_weight,
        target_reps: routineSet.target_reps,
        target_duration: routineSet.target_duration,
        target_distance: routineSet.target_distance,
        rest_seconds: routineSet.rest_seconds,
        is_warmup: routineSet.is_warmup,
        is_failure: routineSet.is_failure,
        is_drop_set: routineSet.is_drop_set,
        is_super_set: routineSet.is_super_set,
      })),
    })),
  };
}

export async function createRoutine(name: string, exercises: SelectedRoutineExercise[]) {
  const response = await api.post<CreatedRoutine>("/routines", {
    ...routinePayload(name, exercises),
  });
  return response.data;
}

export async function getRoutines() {
  const response = await api.get<Routine[]>("/routines");
  return response.data;
}

export async function getRoutine(routineId: number) {
  const response = await api.get<Routine>(`/routines/${routineId}`);
  return response.data;
}

export async function updateRoutine(routineId: number, name: string, exercises: SelectedRoutineExercise[]) {
  const response = await api.put<Routine>(`/routines/${routineId}`, routinePayload(name, exercises));
  return response.data;
}

export async function deleteRoutine(routineId: number) {
  await api.delete(`/routines/${routineId}`);
}

export async function updateRoutineIcon(routineId: number, icon: RoutineIconName) {
  const response = await api.patch<Routine>(`/routines/${routineId}/icon`, { icon });
  return response.data;
}
