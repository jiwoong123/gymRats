import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Dumbbell, LoaderCircle, MoreVertical, Plus, Timer, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { deleteWorkoutSession, getWorkoutCalendar, getWorkoutHistory } from "../../api/workout";
import { getErrorMessage } from "../../utils/apiError";
import "./Workouts.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(value))
    .replaceAll(". ", ".")
    .replace(/\.$/, "");
}

const BODY_PART_LABELS: Record<number, string> = {
  1: "가슴",
  2: "등",
  3: "어깨",
  4: "이두",
  5: "삼두",
  6: "전완",
  7: "하체",
  8: "코어",
};

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthCells(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  return [
    ...Array<null>(mondayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ];
}

export default function Workouts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const calendarMonthValue = toDateValue(calendarMonth);
  const calendar = useQuery({
    queryKey: ["workout-calendar", calendarMonthValue],
    queryFn: () => getWorkoutCalendar(calendarMonthValue),
  });
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
        queryClient.refetchQueries({ queryKey: ["workout-calendar"], type: "all" }),
        queryClient.refetchQueries({ queryKey: ["personal-record-exercises"], type: "all" }),
        queryClient.refetchQueries({ queryKey: ["personal-record-exercise"], type: "all" }),
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

  function changeCalendarMonth(amount: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  const workoutDays = new Map(calendar.data?.map((day) => [day.date, day.body_parts]) ?? []);
  const monthCells = getMonthCells(calendarMonth);

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

      <section className="seven-day-summary" aria-labelledby="seven-day-title">
        <div className="seven-day-heading">
          <div>
            <p>WORKOUT CALENDAR</p>
            <h2 id="seven-day-title">운동 캘린더</h2>
          </div>
          {calendar.data && <strong>{calendar.data.length}<span>일 운동</span></strong>}
        </div>

        <div className="calendar-month-picker">
          <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="이전 달"><ChevronLeft size={18} /></button>
          <strong>{calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월</strong>
          <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="다음 달"><ChevronRight size={18} /></button>
        </div>

        {calendar.isPending ? (
          <div className="summary-inline-state"><LoaderCircle className="history-spin" />달력을 불러오는 중...</div>
        ) : calendar.isError ? (
          <div className="summary-inline-state"><span>달력을 불러오지 못했습니다.</span><button onClick={() => calendar.refetch()}>다시 시도</button></div>
        ) : (
          <div className="workout-calendar" aria-label={`${calendarMonth.getFullYear()}년 ${calendarMonth.getMonth() + 1}월 운동 달력`}>
            {['월', '화', '수', '목', '금', '토', '일'].map((weekday) => <span className="calendar-weekday" key={weekday}>{weekday}</span>)}
            {monthCells.map((day, index) => {
              if (!day) return <span className="calendar-day empty" aria-hidden="true" key={`empty-${index}`} />;
              const dateValue = toDateValue(day);
              const bodyParts = workoutDays.get(dateValue) ?? [];
                return (
                  <div className={`calendar-day${bodyParts.length ? " trained" : ""}`} key={dateValue}>
                    <strong>{day.getDate()}</strong>
                    <div className="calendar-parts">
                      {bodyParts.map((part) => <small key={part}>{BODY_PART_LABELS[part] ?? "기타"}</small>)}
                    </div>
                  </div>
                );
            })}
          </div>
        )}

      </section>

      <h2 className="history-section-title">전체 운동 기록</h2>

      {history.isPending ? (
        <div className="history-state"><LoaderCircle className="history-spin" />기록을 불러오는 중...</div>
      ) : history.isError ? (
        <div className="history-state"><p>운동 기록을 불러오지 못했습니다.</p><button onClick={() => history.refetch()}>다시 시도</button></div>
      ) : sessions.length === 0 ? (
        <div className="history-state"><Dumbbell size={30} /><p>완료한 운동이 아직 없습니다.</p></div>
      ) : (
        <div className="history-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="history-item"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/records/workouts/${session.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/records/workouts/${session.id}`);
                }
              }}
            >
              <div className="history-top">
                <span className="history-date">{formatDate(session.performed_at)}</span>
                <div className="history-options" onClick={(event) => event.stopPropagation()}>
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
                <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
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
