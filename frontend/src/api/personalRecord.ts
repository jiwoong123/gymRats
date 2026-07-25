import api from "./axios";

export type PersonalRecordHistoryItem = {
  id: number;
  exercise_id: number;
  exercise: string;
  weight: number;
  achieved_at: string;
};

export type PersonalRecordHistoryPage = {
  items: PersonalRecordHistoryItem[];
  next_offset: number | null;
};

export async function getPersonalRecordHistory(offset: number, limit = 20) {
  const response = await api.get<PersonalRecordHistoryPage>("/personal-records/history", {
    params: { offset, limit },
  });
  return response.data;
}
