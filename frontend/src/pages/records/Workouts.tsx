import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Dumbbell, LoaderCircle, MoreVertical, Plus, Timer, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { deleteWorkoutSession, getWorkoutHistory } from "../../api/workout";
import { getErrorMessage } from "../../utils/apiError";
import "./Workouts.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(value))
    .replaceAll(". ", ".")
    .replace(/\.$/, "");
}

export default function Workouts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const history = useInfiniteQuery({
    queryKey: ["workout-history"],
    queryFn: ({ pageParam }) => getWorkoutHistory(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_offset ?? undefined,
  });
  const deleteSession = useMutation({
    mutationFn: deleteWorkoutSession,
    onSuccess: async () => {
      setOpenMenuId(null);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["home"], exact: true, type: "all" }),
        queryClient.refetchQueries({ queryKey: ["workout-history"], exact: true, type: "all" }),
      ]);
    },
    onError: (error) => setDeleteError(getErrorMessage(error)),
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = history;
  const sessions = history.data?.pages.flatMap((page) => page.items) ?? [];

  function handleDelete(sessionId: number) {
    if (!window.confirm("이 운동 기록을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) return;
    setDeleteError("");
    deleteSession.mutate(sessionId);
  }

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    }, { rootMargin: "180px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
    <div
      className="workouts-page"
      inert={deleteSession.isPending ? true : undefined}
      aria-busy={deleteSession.isPending}
    >
      <div className="workouts-header">
        <h1 className="workouts-title">운동 기록</h1>
        <button className="new-workout-btn" onClick={() => navigate("/routine/new")}><Plus size={18} /> 루틴 만들기</button>
      </div>

      {deleteError && <p className="history-delete-error" role="alert">{deleteError}</p>}

      {history.isPending ? (
        <div className="history-state"><LoaderCircle className="history-spin" />기록을 불러오는 중...</div>
      ) : history.isError ? (
        <div className="history-state"><p>운동 기록을 불러오지 못했습니다.</p><button onClick={() => history.refetch()}>다시 시도</button></div>
      ) : sessions.length === 0 ? (
        <div className="history-state"><Dumbbell size={30} /><p>완료한 운동이 아직 없습니다.</p></div>
      ) : (
        <div className="history-list">
          {sessions.map((session) => (
            <div key={session.id} className="history-item">
              <div className="history-top">
                <span className="history-date">{formatDate(session.performed_at)}</span>
                <div className="history-options">
                  <button
                    type="button"
                    className="history-options-btn"
                    aria-label={`${session.name} 기록 옵션`}
                    aria-expanded={openMenuId === session.id}
                    onClick={() => setOpenMenuId((current) => current === session.id ? null : session.id)}
                  >
                    <MoreVertical size={17} />
                  </button>
                  {openMenuId === session.id && (
                    <div className="history-options-menu">
                      <button
                        type="button"
                        className="history-delete-btn"
                        disabled={deleteSession.isPending}
                        onClick={() => handleDelete(session.id)}
                      >
                        {deleteSession.isPending ? <LoaderCircle className="history-spin" size={14} /> : <Trash2 size={14} />}
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
                <h3 className="history-name">{session.name}</h3>
                <span className="history-duration"><Timer size={11} /> {session.duration}분</span>
              <p className="history-exercises">{session.exercise_names.length ? session.exercise_names.join(" · ") : "운동 없음"}</p>
              <div className="history-bottom">
                <span className="history-volume">{(session.volume / 1000).toFixed(1)}<span>T</span></span>
                <ChevronRight size={16} style={{ color: "#7070a0" }} />
              </div>
            </div>
          ))}
          <div className="history-sentinel" ref={loadMoreRef}>
            {history.isFetchingNextPage && <><LoaderCircle className="history-spin" size={18} />기록을 더 불러오는 중...</>}
          </div>
        </div>
      )}
    </div>
    {deleteSession.isPending && (
      <div className="history-delete-blocker" role="status" aria-live="polite">
        <LoaderCircle className="history-spin" size={24} />
        운동 기록을 삭제하는 중...
      </div>
    )}
    </>
  );
}
