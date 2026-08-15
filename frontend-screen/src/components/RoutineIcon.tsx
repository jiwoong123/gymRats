import {
  Dumbbell,
  Flame,
  HeartPulse,
  Target,
  Trophy,
  Zap,
  type LucideProps,
} from "lucide-react";

export const ROUTINE_ICONS = ["dumbbell", "flame", "target", "zap", "heart", "trophy"] as const;

export type RoutineIconName = typeof ROUTINE_ICONS[number];

const ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  zap: Zap,
  heart: HeartPulse,
  trophy: Trophy,
};

export default function RoutineIcon({ name, ...props }: Omit<LucideProps, "name"> & { name?: string | null }) {
  const Icon = ICONS[name as RoutineIconName] ?? Dumbbell;
  return <Icon {...props} />;
}
