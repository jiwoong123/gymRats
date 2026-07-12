import { useQuery } from "@tanstack/react-query";
import { getHome } from "../api/dashboardApi";

export function useDashboard() {
  return useQuery({
    queryKey: ["home"],
    queryFn: getHome,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,

  });
}