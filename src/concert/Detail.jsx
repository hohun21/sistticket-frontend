import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./Detail.module.css";
import ConcertVenueReviews from "./ConcertVenueReviews";

const API_BASE = "http://localhost";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* 백엔드 LocalDateTime은 한국 시간으로 해석 */
function toTimestamp(value) {
  if (!value) return NaN;

  const text = String(value);
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(text)
    ? text
    : `${text}+09:00`;

  return Date.parse(normalized);
}

function dateKey(value) {
  return value ? String(value).slice(0, 10) : "";
}

function timeLabel(value) {
  return value ? String(value).slice(11, 16) : "-";
}

function monthKey(value) {
  return value ? String(value).slice(0, 7) : "";
}

function shiftMonth(value, offset) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function bookingState(performance, now, concertStatus) {
  if (!performance) {
    return { available: false, label: "회차를 확인해 주세요." };
  }

  if (
    concertStatus === "ISCANCELED" ||
    performance.status === "ISCANCELED"
  ) {
    return { available: false, label: "취소된 공연입니다." };
  }

  const showTime = toTimestamp(performance.performanceDate);
  const start = toTimestamp(performance.bookingStart);
  const end = toTimestamp(performance.bookingEnd);

  if (!Number.isFinite(showTime)) {
    return { available: false, label: "공연 일정을 확인 중입니다." };
  }

  if (performance.status === "FINISHED" || now >= showTime) {
    return { available: false, label: "지난 회차입니다." };
  }

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start >= end
  ) {
    return { available: false, label: "예매 기간을 확인 중입니다." };
  }

  if (now < start) {
    return { available: false, label: "예매 오픈 전입니다." };
  }

  if (now >= end) {
    return { available: false, label: "예매가 마감되었습니다." };
  }

  return { available: true, label: "예매 가능" };
}

function posterUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value, API_BASE);

    return ["http:", "https:"].includes(url.protocol)
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

export default function Detail() {
  const { concertId } = useParams();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState("");
  const [viewDate, setViewDate] = useState("");
  const [viewedId, setViewedId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [brokenPoster, setBrokenPoster] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetail() {
      setLoading(true);
      setError("");
      setConcert(null);
      setBrokenPoster(false);
      setBookingError("");

      try {
        const response = await fetch(
          `${API_BASE}/api/concert/${encodeURIComponent(concertId)}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (
          !response.ok ||
          response.redirected ||
          !(response.headers.get("content-type") || "").includes("json")
        ) {
          throw new Error("공연 정보를 불러오지 못했습니다.");
        }

        const data = await response.json();
        const performances = [...(data.performanceList || [])]
          .filter((item) =>
            Number.isFinite(toTimestamp(item.performanceDate))
          )
          .sort(
            (a, b) =>
              toTimestamp(a.performanceDate) -
              toTimestamp(b.performanceDate)
          );

        const initial =
          performances.find(
            (item) => toTimestamp(item.performanceDate) > Date.now()
          ) || performances.at(-1);

        setConcert({ ...data, performanceList: performances });
        setViewDate(initial ? dateKey(initial.performanceDate) : "");
        setViewedId(initial?.performanceId ?? null);
        setMonth(
          initial
            ? monthKey(initial.performanceDate)
            : new Intl.DateTimeFormat("sv-SE", {
              timeZone: "Asia/Seoul",
              year: "numeric",
              month: "2-digit",
            }).format(new Date())
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDetail();

    return () => controller.abort();
  }, [concertId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const performances = concert?.performanceList || [];

  const dates = useMemo(() => {
    const map = new Map();

    for (const performance of concert?.performanceList || []) {
      const key = dateKey(performance.performanceDate);
      const items = map.get(key) || [];
      items.push(performance);
      map.set(key, items);
    }

    return map;
  }, [concert]);

  const dayPerformances = dates.get(viewDate) || [];

  const viewedPerformance =
    dayPerformances.find(
      (item) => String(item.performanceId) === String(viewedId)
    ) || null;

  const currentBookingState = bookingState(
    viewedPerformance,
    now,
    concert?.status
  );

  const months = performances.map((item) =>
    monthKey(item.performanceDate)
  );

  const minMonth = months[0] || month;
  const maxMonth = months.at(-1) || month;

  const calendarDays = useMemo(() => {
    if (!month) return [];

    const [year, monthNumber] = month.split("-").map(Number);
    const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
    const count = new Date(year, monthNumber, 0).getDate();

    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ];
  }, [month]);

  function viewDay(key) {
    const items = dates.get(key);
    if (!items?.length) return;

    setViewDate(key);
    setViewedId(items[0].performanceId);
    setBookingError("");
  }

  async function goToSeats() {
    const latest = bookingState(
      viewedPerformance,
      Date.now(),
      concert?.status
    );

    if (!latest.available || checkingLogin) {
      setNow(Date.now());
      return;
    }

    const seatUrl =
      `/seat/select?performanceId=` +
      encodeURIComponent(viewedPerformance.performanceId);

    setCheckingLogin(true);
    setBookingError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/mypage/user-info`,
        { credentials: "include" }
      );

      if (response.status === 401 || response.redirected) {
        navigate(
          `/member/login?returnTo=${encodeURIComponent(seatUrl)}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error("로그인 상태를 확인하지 못했습니다.");
      }

      /* 로그인 확인 중 예매 시간이 끝난 경우도 다시 검사 */
      const rechecked = bookingState(
        viewedPerformance,
        Date.now(),
        concert?.status
      );

      if (!rechecked.available) {
        setNow(Date.now());
        setBookingError(rechecked.label);
        return;
      }

      navigate(seatUrl);
    } catch (requestError) {
      setBookingError(requestError.message);
    } finally {
      setCheckingLogin(false);
    }
  }

  const image = posterUrl(concert?.imgUrl);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="http://localhost/" className={styles.brand}>
          SIST TICKET
        </a>

        <Link to="/concert/list">공연 목록</Link>
      </header>

      <main className={styles.container}>
        {loading ? (
          <p className={styles.notice}>공연 정보를 불러오는 중입니다.</p>
        ) : error ? (
          <div className={styles.notice} role="alert">
            <p>{error}</p>
            <Link to="/concert/list">공연 목록으로 돌아가기</Link>
          </div>
        ) : concert ? (
          <div className={styles.layout}>
            <article className={styles.content}>
              <div className={styles.hero}>
                {image && !brokenPoster ? (
                  <>
                    <div
                      className={styles.heroBackdrop}
                      style={{ backgroundImage: `url("${image}")` }}
                      aria-hidden="true"
                    />
                    <img
                      className={styles.poster}
                      src={image}
                      alt={`${concert.concertName} 포스터`}
                      onError={() => setBrokenPoster(true)}
                    />
                  </>
                ) : (
                  <span className={styles.posterPlaceholder}>
                    SIST TICKET
                  </span>
                )}
              </div>

              <div className={styles.titleBlock}>
                <span className={styles.genre}>
                  {concert.genreName || "공연"}
                </span>
                <h1>{concert.concertName}</h1>
              </div>

              <nav className={styles.tabs} aria-label="공연 상세 항목">
                <a href="#concert-info">공연 정보</a>
                <a href="#concert-cast">회차 · 캐스팅</a>
                <a href="#concert-venue">장소</a>
                <a href="#concert-reviews">리뷰</a>
              </nav>

              <section id="concert-info" className={styles.section}>
                <h2>공연 정보</h2>

                <dl className={styles.infoList}>
                  <dt>장소</dt>
                  <dd>{concert.venueName || "공연장 미정"}</dd>

                  <dt>기간</dt>
                  <dd>
                    {dateKey(concert.startDate) || "미정"}
                    {" ~ "}
                    {dateKey(concert.endDate) || "미정"}
                  </dd>

                  <dt>공연 시간</dt>
                  <dd>
                    {concert.runTimeMinutes > 0
                      ? `${concert.runTimeMinutes}분`
                      : "확인 중"}
                  </dd>
                </dl>
              </section>

              <section id="concert-cast" className={styles.section}>
                <h2>회차 · 캐스팅</h2>

                {viewedPerformance ? (
                  <>
                    <p className={styles.sessionHeading}>
                      {viewDate} ·{" "}
                      {timeLabel(viewedPerformance.performanceDate)}
                      {viewedPerformance.performanceSeq != null &&
                        ` · ${viewedPerformance.performanceSeq}회차`}
                    </p>

                    <p className={styles.sessionStatus}>
                      {currentBookingState.label}
                    </p>

                    {viewedPerformance.casts?.length ? (
                      <div className={styles.castGrid}>
                        {viewedPerformance.casts.map((cast, index) => (
                          <div
                            key={`${cast.roleName}-${cast.actorName}-${index}`}
                            className={styles.castCard}
                          >
                            <span>{cast.roleName}</span>
                            <strong>{cast.actorName}</strong>
                            {cast.description && (
                              <p>{cast.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.muted}>
                        등록된 캐스팅 정보가 없습니다.
                      </p>
                    )}
                  </>
                ) : (
                  <p className={styles.muted}>
                    달력에서 공연 날짜를 선택해 주세요.
                  </p>
                )}
              </section>

              <section id="concert-venue" className={styles.section}>
                {/* 기존 장소 내용 */}
              </section>
              <ConcertVenueReviews
                key={concert.concertId}
                concert={concert}
              />
            </article>

            <aside className={styles.bookingPanel}>
              <div className={styles.monthHeader}>
                <button
                  type="button"
                  aria-label="이전 달"
                  disabled={month <= minMonth}
                  onClick={() => setMonth(shiftMonth(month, -1))}
                >
                  ‹
                </button>

                <h2>{month.replace("-", ".")}</h2>

                <button
                  type="button"
                  aria-label="다음 달"
                  disabled={month >= maxMonth}
                  onClick={() => setMonth(shiftMonth(month, 1))}
                >
                  ›
                </button>
              </div>

              <div className={styles.calendar}>
                {WEEKDAYS.map((day) => (
                  <span key={day} className={styles.weekday}>
                    {day}
                  </span>
                ))}

                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <span key={`empty-${index}`} />;
                  }

                  const key = `${month}-${String(day).padStart(2, "0")}`;
                  const hasPerformance = dates.has(key);
                  const selected = key === viewDate;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!hasPerformance}
                      aria-label={`${key}${hasPerformance ? " 공연 정보 보기" : " 공연 없음"}`}
                      aria-pressed={selected}
                      className={`${styles.day} ${selected ? styles.selectedDay : ""
                        }`}
                      onClick={() => viewDay(key)}
                    >
                      {day}
                      {hasPerformance && <i aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              <p className={styles.calendarHint}>
                공연 날짜를 누르면 지난 회차 정보도 볼 수 있습니다.
              </p>

              <div className={styles.sessions}>
                {dayPerformances.length ? (
                  dayPerformances.map((performance) => {
                    const state = bookingState(
                      performance,
                      now,
                      concert.status
                    );

                    const selected =
                      String(performance.performanceId) ===
                      String(viewedId);

                    return (
                      <button
                        key={performance.performanceId}
                        type="button"
                        aria-pressed={selected}
                        className={`${styles.session} ${selected ? styles.viewedSession : ""
                          }`}
                        onClick={() => {
                          setViewedId(performance.performanceId);
                          setBookingError("");
                        }}
                      >
                        <span className={styles.sessionTop}>
                          <strong>
                            {timeLabel(performance.performanceDate)}
                          </strong>

                          {performance.performanceSeq != null && (
                            <span>{performance.performanceSeq}회차</span>
                          )}
                        </span>

                        <span
                          className={
                            state.available
                              ? styles.available
                              : styles.unavailable
                          }
                        >
                          {state.label}
                        </span>

                        <span className={styles.castPreview}>
                          {performance.casts?.length
                            ? performance.casts
                              .map((cast) => cast.actorName)
                              .join(", ")
                            : "캐스팅 정보 확인 중"}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className={styles.muted}>
                    {performances.length
                      ? "공연 날짜를 선택해 주세요."
                      : "등록된 공연 회차가 없습니다."}
                  </p>
                )}
              </div>

              {bookingError && (
                <p className={styles.error} role="alert">
                  {bookingError}
                </p>
              )}

              <button
                type="button"
                className={styles.bookButton}
                disabled={
                  !currentBookingState.available || checkingLogin
                }
                onClick={goToSeats}
              >
                {checkingLogin
                  ? "확인 중..."
                  : currentBookingState.available
                    ? "예매하기"
                    : "예매 불가"}
              </button>

              {viewedPerformance && !currentBookingState.available && (
                <p className={styles.bookingHint}>
                  회차 정보는 확인할 수 있지만 예매는 불가능합니다.
                </p>
              )}
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}