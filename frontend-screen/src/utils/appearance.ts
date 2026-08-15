export type AppearanceMode = "dark" | "light";

const APPEARANCE_STORAGE_KEY = "gymrats-appearance";

export function getStoredAppearance(): AppearanceMode {
  return localStorage.getItem(APPEARANCE_STORAGE_KEY) === "light" ? "light" : "dark";
}

export function applyAppearance(mode: AppearanceMode) {
  document.documentElement.dataset.mode = mode;
  localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
}
