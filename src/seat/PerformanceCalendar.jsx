import { useState } from "react";
import styles from "./SeatSelect.module.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 서버의 LocalDateTime은 한국 시간 기준으로 표시
function sessionTime(value) {
  return Date.parse(
    `${value.replace(/\.\d+$/, "")}+09:00`
  );
}

function moveMonth(month, amount) {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(year, number - 1 + amount, 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
  ].join("-");
}

export default function PerformanceCalendar({
  schedules,
  current,
  onSelect,
  disabled = false,
}) {
  const [month, setMonth] = useState(
    current.performanceDate.slice(0, 7)
  );

  const [selectedDate, setSelectedDate] = useState(
    current.performanceDate.slice(0, 10)
  );

  const validSchedules = schedules.filter(
    (schedule) => typeof schedule.performanceDate === "string"
  );

  const dates = [
    ...new Set(
      validSchedules.map((schedule) =>
        schedule.performanceDate.slice(0, 10)
      )
    ),
  ].sort();

  const dateSet = new Set(dates);

  const minMonth = dates[0]?.slice(0, 7) ?? month;
  const maxMonth = dates.at(-1)?.slice(0, 7) ?? month;

  // 한국 기준 오늘 날짜
  const today = new Date(
    Date.now() + 9 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  const [year, monthNumber] = month.split("-").map(Number);
  const firstWeekday = new Date(
    year,
    monthNumber - 1,
    1
  ).getDay();

  const lastDay = new Date(
    year,
    monthNumber,
    0
  ).getDate();

  const sessions = validSchedules
    .filter((schedule) =>
      schedule.performanceDate.startsWith(selectedDate)
    )
    .sort((a, b) =>
      a.performanceDate.localeCompare(b.performanceDate)
    );

  function changeMonth(amount) {
    setMonth((previous) => moveMonth(previous, amount));
    setSelectedDate("");
  }

  return (
    <section
      id="performance-calendar"
      className={styles.calendar}
      aria-label="공연 날짜와 회차 선택"
    >
      <div className={styles.monthHeader}>
        <button
          type="button"
          aria-label="이전 달"
          disabled={disabled || month <= minMonth}
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>

        <strong>
          {year}년 {monthNumber}월
        </strong>

        <button
          type="button"
          aria-label="다음 달"
          disabled={disabled || month >= maxMonth}
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>

      <div className={styles.calendarGrid}>
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className={styles.weekday}
          >
            {weekday}
          </span>
        ))}

        {Array.from({ length: firstWeekday }, (_, index) => (
          <span
            key={`empty-${index}`}
            aria-hidden="true"
          />
        ))}

        {Array.from({ length: lastDay }, (_, index) => {
          const day = index + 1;
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const hasPerformance = dateSet.has(date);
          const isPast = date < today;
          const selected = date === selectedDate;

          return (
            <button
              key={date}
              type="button"
              className={[
                styles.calendarDay,
                selected ? styles.activeDay : "",
              ].join(" ")}
              disabled={
                disabled ||
                !hasPerformance ||
                isPast
              }
              aria-label={`${year}년 ${monthNumber}월 ${day}일`}
              aria-pressed={selected}
              onClick={() => setSelectedDate(date)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className={styles.timeSection}>
        <p className={styles.smallLabel}>
          공연 시간
        </p>

        {!selectedDate ? (
          <p className={styles.muted}>
            날짜를 선택해 주세요.
          </p>
        ) : (
          <div className={styles.timeList}>
            {sessions.map((schedule) => {
              const isCurrent =
                schedule.performanceId === current.performanceId;

              const isPast =
                sessionTime(schedule.performanceDate) <= Date.now();

              return (
                <button
                  key={schedule.performanceId}
                  type="button"
                  className={[
                    styles.timeButton,
                    isCurrent ? styles.activeTime : "",
                  ].join(" ")}
                  disabled={disabled || isPast}
                  aria-pressed={isCurrent}
                  onClick={() =>
                    onSelect(schedule.performanceId)
                  }
                >
                  <strong>
                    {schedule.performanceDate.slice(11, 16)}
                  </strong>

                  <small>
                    {schedule.performanceSeq ?? "-"}회차
                    {isPast ? " · 지난 회차" : ""}
                  </small>
                </button>
              );
            })}

            {sessions.length === 0 && (
              <p className={styles.muted}>
                등록된 회차가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}