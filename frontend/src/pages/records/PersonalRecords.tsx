import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderCircle, Trophy } from "lucide-react";
import { getPersonalRecordHistory } from "../../api/personalRecord";
import "./PersonalRecords.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function PersonalRecords() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const history = useInfiniteQuery({
    queryKey: ["personal-record-history"],
    queryFn: ({ pageParam }) => getPersonalRecordHistory(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_offset ?? undefined,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = history;
  const records = history.data?.pages.flatMap((page) => page.items) ?? [];

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
    <div className="pr-history-page">
      <header className="pr-history-header">
        <div>
          <p>PERSONAL BEST</p>
          <h1>신기록 히스토리</h1>
        </div>
        <div className="pr-history-mark"><Trophy size={22} /></div>
      </header>

      {history.isPending ? (
        <div className="pr-history-state"><LoaderCircle className="pr-history-spin" />기록을 불러오는 중...</div>
      ) : history.isError ? (
        <div className="pr-history-state">
          <p>신기록을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => history.refetch()}>다시 시도</button>
        </div>
      ) : records.length === 0 ? (
        <div className="pr-history-state">
          <Trophy size={32} />
          <p>아직 달성한 신기록이 없습니다.</p>
        </div>
      ) : (
        <div className="pr-history-list">
          {records.map((record) => (
            <article className="pr-history-item" key={record.id}>
              <div className="pr-history-icon"><Trophy size={17} /></div>
              <div className="pr-history-info">
                <h2>{record.exercise}</h2>
                <time dateTime={record.achieved_at}>{formatDate(record.achieved_at)}</time>
              </div>
              <p className="pr-history-weight">
                {record.weight.toLocaleString()}<span>kg</span>
              </p>
            </article>
          ))}
          <div className="pr-history-sentinel" ref={loadMoreRef}>
            {isFetchingNextPage && <><LoaderCircle className="pr-history-spin" size={18} />기록을 더 불러오는 중...</>}
          </div>
        </div>
      )}
    </div>
  );
}
