import { useEffect, useRef, useState } from "react";
import BookingConfirmModal from "./BookingConfirmModal";
import PerformanceCalendar from "./PerformanceCalendar";
import styles from "./SeatSelect.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";

import { SeatApiError } from "./seatApi";
import { loginPath, seatPath } from "./seatFlow";

const API_BASE_URL = "http://localhost";

const FLOOR_ROWS = [
  { name: "1층", rows: ["A", "B", "C", "D", "E"] },
  { name: "2층", rows: ["F", "G", "H"] },
];

const KNOWN_ROWS = new Set(
  FLOOR_ROWS.flatMap((floor) => floor.rows)
);

const GRADE_COLORS = {
  S: "#6243cf",
  A: "#3f86d9",
  R: "#23a58e",
};

const STATUS_LABELS = {
  AVAILABLE: "선택 가능",
  HELD: "임시 선점",
  RESERVED: "예매 완료",
};

function gradeKey(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/석$/, "");
}

function gradeLabel(value) {
  const grade = gradeKey(value);
  return grade ? `${grade}석` : "등급 미정";
}

function gradeColor(value) {
  return GRADE_COLORS[gradeKey(value)] ?? "#7c8197";
}

function validPrice(value) {
  return Number.isFinite(value) && value >= 0;
}

function money(value) {
  return validPrice(value)
    ? `${value.toLocaleString("ko-KR")}원`
    : "가격 확인 필요";
}

function rowLabel(seat) {
  return String(seat.rowLabel ?? "?").trim().toUpperCase();
}

function formatPerformanceDate(value) {
  if (typeof value !== "string" || !value) {
    return "일정 미정";
  }

  const date = value.slice(0, 10).replaceAll("-", ".");
  const time = value.slice(11, 16);

  return time ? `${date} · ${time}` : date;
}

// 서버에서 JSON 데이터를 비동기로 조회
async function fetchJson(url, signal) {
  let response;

  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "서버에 연결하지 못했습니다. 로그인 상태와 서버 실행 여부를 확인해 주세요."
    );
  }

  if (response.status === 401) {
    throw new SeatApiError(
      "로그인 후 이용해 주세요.",
      401
    );
  }

  if (response.status === 403) {
    throw new Error("해당 정보를 조회할 권한이 없습니다.");
  }

  if (response.redirected) {
    throw new Error(
      "로그인 상태와 접근 권한을 확인한 뒤 다시 이용해 주세요."
    );
  }

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "요청한 공연 회차 정보를 찾을 수 없습니다."
        : `정보를 불러오지 못했습니다. (${response.status})`
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("json")) {
    throw new Error("서버가 JSON 형식으로 응답하지 않았습니다.");
  }

  try {
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error("서버 응답을 읽지 못했습니다.");
  }
}

// URL 예시: /seat/select?performanceId=19
export default function SeatSelect({ onCheckout }) {
  const [params, setParams] = useSearchParams();

  const rawId = params.get("performanceId") ?? "";
  const performanceId = Number(rawId);

  const validId =
    /^\d+$/.test(rawId) &&
    Number.isSafeInteger(performanceId) &&
    performanceId > 0;

  if (!validId) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1>공연 회차를 선택해 주세요.</h1>
          <p>공연 상세 화면에서 예매할 회차를 선택해 주세요.</p>
        </div>
      </main>
    );
  }

  function changePerformance(nextId) {
    const nextParams = new URLSearchParams(params);
    nextParams.set("performanceId", String(nextId));
    setParams(nextParams);
  }

  return (
    <SeatPage
      key={performanceId}
      performanceId={performanceId}
      onChangePerformance={changePerformance}
      onCheckout={onCheckout}
    />
  );
}

function SeatPage({
  performanceId,
  onChangePerformance,
  onCheckout,
}) {
  const [data, setData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const [errorStatus, setErrorStatus] = useState(0);
  const checkoutLock = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorStatus(0);
      setError("");
      setData(null);
      setSelectedIds([]);

      const baseUrl =
        `${API_BASE_URL}/api/performances/` +
        encodeURIComponent(performanceId);

      try {
        // 세 요청을 동시에 실행
        const [info, schedules, seats] = await Promise.all([
          fetchJson(
            `${baseUrl}/seat-info`,
            controller.signal
          ),
          fetchJson(
            `${baseUrl}/seat-schedules`,
            controller.signal
          ),

          // http://localhost/api/performances/{performanceId}/seats
          fetchJson(
            `${baseUrl}/seats`,
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        if (
          !info ||
          typeof info !== "object" ||
          Array.isArray(info) ||
          !Array.isArray(schedules) ||
          !Array.isArray(seats)
        ) {
          throw new Error(
            "공연 또는 좌석 정보 응답 형식이 올바르지 않습니다."
          );
        }

        // 서버에서 받은 JSON을 상태에 저장
        setData({
          info,
          schedules,
          seats,
        });
      } catch (loadError) {
        if (controller.signal.aborted) return;

        setErrorStatus(loadError.status ?? 0);
        setError(
          loadError.message || "정보를 불러오지 못했습니다."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    // 회차 변경이나 화면 이동 시 이전 요청 취소
    return () => controller.abort();
  }, [performanceId, refreshCount]);

  const seats = data?.seats ?? [];

  const selectedSeats = seats.filter((seat) =>
    selectedIds.includes(seat.performanceSeatId)
  );

  const totalPrice = selectedSeats.reduce(
    (total, seat) => total + seat.price,
    0
  );

  const availableCount = seats.filter(
    (seat) => seat.status === "AVAILABLE"
  ).length;

  const grades = [
    ...new Map(
      seats.map((seat) => [
        `${gradeKey(seat.gradeName)}:${seat.price}`,
        {
          name: seat.gradeName,
          price: seat.price,
        },
      ])
    ).values(),
  ].sort((a, b) => {
    const order = { S: 0, A: 1, R: 2 };

    return (
      (order[gradeKey(a.name)] ?? 3) -
      (order[gradeKey(b.name)] ?? 3)
    );
  });

  function toggleSeat(seat) {
    if (
      loading ||
      checking ||
      checkoutLock.current ||
      seat.status !== "AVAILABLE" ||
      !validPrice(seat.price)
    ) {
      return;
    }

    const alreadySelected = selectedIds.includes(
      seat.performanceSeatId
    );

    if (!alreadySelected && selectedIds.length >= 5) {
      setError("한 번에 최대 5매까지 예매할 수 있습니다.");
      return;
    }

    setErrorStatus(0);
    setError("");

    setSelectedIds((previous) => {
      if (previous.includes(seat.performanceSeatId)) {
        return previous.filter(
          (id) => id !== seat.performanceSeatId
        );
      }

      return previous.length < 5
        ? [...previous, seat.performanceSeatId]
        : previous;
    });
  }

  function refreshSeats() {
    if (loading || checking || checkoutLock.current) return;

    setSelectedIds([]);
    setLoading(true);
    setRefreshCount((count) => count + 1);
  }

  function selectPerformance(nextId) {
    if (checking || checkoutLock.current) return;

    setCalendarOpen(false);

    if (nextId !== performanceId) {
      onChangePerformance(nextId);
    }
  }

  function continueCheckout() {
  if (
    checkoutLock.current ||
    loading ||
    checking ||
    selectedSeats.length === 0 ||
    typeof onCheckout !== "function"
  ) {
    return;
  }

  setErrorStatus(0);
  setError("");
  setCalendarOpen(false);
  setConfirmOpen(true);
}

async function confirmCheckout() {
  if (
    checkoutLock.current ||
    loading ||
    checking ||
    selectedSeats.length === 0 ||
    typeof onCheckout !== "function"
  ) {
    return;
  }

  setConfirmOpen(false);
  checkoutLock.current = true;
  setChecking(true);
  setErrorStatus(0);
  setError("");

  try {
    await onCheckout({
      performanceId,
      performanceSeatIds: selectedSeats.map(
        (seat) => seat.performanceSeatId
      ),
    });
  } catch (checkoutError) {
    setErrorStatus(checkoutError.status ?? 0);
    setError(
      checkoutError.message ||
        "좌석 선점 중 오류가 발생했습니다."
    );
  } finally {
    checkoutLock.current = false;
    setChecking(false);
  }
}

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <strong className={styles.brand}>
          <span>H</span>OON HOme
        </strong>

        <span className={styles.headerText}>
          당신의 다음 순간, 무대 위에서
        </span>
      </header>

      <main className={styles.container}>
        <span className={styles.eyebrow}>SIST TICKET</span>

        <h1>좌석 선택</h1>

        <p className={styles.muted}>
          원하는 날짜와 좌석을 선택해 주세요.
        </p>

        {error && (
          <div className={styles.error} role="alert">
            <p>{error}</p>

            <button
              type="button"
              className={styles.secondaryButton}
              disabled={loading || checking}
              onClick={() =>
                navigate(
                  errorStatus === 401
                    ? loginPath(performanceId)
                    : seatPath(performanceId),
                  { replace: true }
                )
              }
            >
              {errorStatus === 401
                ? "로그인하러 가기"
                : "좌석 다시 선택"}
            </button>
          </div>
        )}

        {loading && (
          <p className={styles.loading} role="status">
            공연과 좌석 정보를 불러오는 중입니다.
          </p>
        )}

        {data && (
          <>
            <section className={styles.performanceInfo}>
              <div>
                <small>선택한 공연</small>
                <h2>{data.info.concertName}</h2>

                <p>
                  {formatPerformanceDate(
                    data.info.performanceDate
                  )}
                  {" · "}
                  {data.info.venueName}
                </p>
              </div>

              <span className={styles.badge}>
                회차 #{performanceId}
              </span>
            </section>

            <div className={styles.layout}>
              <section className={styles.mapPanel}>
                <div className={styles.panelHeading}>
                  <div>
                    <h2>공연장 좌석도</h2>

                    <p className={styles.muted}>
                      전체 {seats.length}석 · 선택 가능{" "}
                      {availableCount}석
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={loading || checking}
                    onClick={refreshSeats}
                  >
                    새로고침
                  </button>
                </div>

                <div className={styles.stage}>
                  STAGE · 무대
                </div>

                <SeatMap
                  seats={seats}
                  selectedIds={selectedIds}
                  onToggle={toggleSeat}
                  disabled={loading || checking}
                />

                {grades.length > 0 && (
                  <div className={styles.legend}>
                    <h3>좌석 등급</h3>

                    <div className={styles.legendItems}>
                      {grades.map((grade) => (
                        <span
                          key={`${grade.name}:${grade.price}`}
                          className={styles.legendItem}
                        >
                          <i
                            aria-hidden="true"
                            style={{
                              background: gradeColor(grade.name),
                            }}
                          />

                          {gradeLabel(grade.name)}
                          {" · "}
                          {money(grade.price)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <aside className={styles.sidebar}>
                <section className={styles.scheduleSection}>
                  <h2>날짜 · 회차</h2>

                  <button
                    type="button"
                    className={styles.dateToggle}
                    disabled={checking}
                    aria-expanded={calendarOpen}
                    aria-controls="performance-calendar"
                    onClick={() =>
                      setCalendarOpen((open) => !open)
                    }
                  >
                    <span>
                      {formatPerformanceDate(
                        data.info.performanceDate
                      )}

                      <small className={styles.dateSession}>
                        회차 #{performanceId}
                      </small>
                    </span>

                    <strong>
                      {calendarOpen ? "닫기" : "변경"}
                    </strong>
                  </button>

                  {calendarOpen && (
                    <PerformanceCalendar
                      schedules={data.schedules}
                      current={data.info}
                      disabled={checking}
                      onSelect={selectPerformance}
                    />
                  )}
                </section>

                <section className={styles.selectionSection}>
                  <div className={styles.panelHeading}>
                    <h2>선택한 좌석</h2>

                    <span className={styles.selectionCount}>
                      {selectedSeats.length}매
                    </span>
                  </div>

                  <div className={styles.selectedList}>
                    {selectedSeats.length === 0 ? (
                      <p className={styles.empty}>
                        좌석을 선택해 주세요.
                      </p>
                    ) : (
                      selectedSeats.map((seat) => (
                        <div
                          key={seat.performanceSeatId}
                          className={styles.selectedItem}
                        >
                          <div>
                            <strong>
                              {rowLabel(seat)}열{" "}
                              {seat.seatNumber}번
                            </strong>

                            <small>
                              {gradeLabel(seat.gradeName)}
                            </small>
                          </div>

                          <strong>{money(seat.price)}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className={styles.paymentSection}>
                  <h2>결제 금액</h2>

                  <div className={styles.priceRow}>
                    <span>티켓 금액</span>
                    <span>{money(totalPrice)}</span>
                  </div>

                  <div className={styles.total}>
                    <div>
                      <strong>총 결제 금액</strong>
                      <small>부가세 포함</small>
                    </div>

                    <strong>{money(totalPrice)}</strong>
                  </div>

                  <button
                    type="button"
                    className={styles.payButton}
                    disabled={
                      loading ||
                      checking ||
                      selectedSeats.length === 0 ||
                      typeof onCheckout !== "function"
                    }
                    onClick={continueCheckout}
                  >
                    {checking ? "처리 중..." : "결제하기"}
                  </button>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
            <BookingConfirmModal
        isOpen={confirmOpen}
        selectedSeats={selectedSeats.map((seat) => ({
          id: seat.performanceSeatId,
          seatName: `${rowLabel(seat)}열 ${seat.seatNumber}번`,
          gradeName: gradeLabel(seat.gradeName),
          price: seat.price,
        }))}
        onConfirm={confirmCheckout}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function SeatMap({
  seats,
  selectedIds,
  onToggle,
  disabled,
}) {
  if (seats.length === 0) {
    return (
      <p className={styles.emptyMap}>
        이 회차에 등록된 좌석이 없습니다.
      </p>
    );
  }

  const actualRows = [
    ...new Set(seats.map(rowLabel)),
  ].sort();

  const otherRows = actualRows.filter(
    (row) => !KNOWN_ROWS.has(row)
  );

  const floors = [
    ...FLOOR_ROWS,
    ...(otherRows.length > 0
      ? [{ name: "기타", rows: otherRows }]
      : []),
  ];

  return (
    <div className={styles.mapScroll}>
      {floors.map((floor) => {
        const rows = floor.rows.filter((row) =>
          actualRows.includes(row)
        );

        if (rows.length === 0) return null;

        return (
          <section
            key={floor.name}
            className={styles.floor}
            aria-label={floor.name}
          >
            <h3 className={styles.floorTitle}>
              {floor.name}
            </h3>

            <div className={styles.rows}>
              {rows.map((row) => {
                const rowSeats = seats
                  .filter((seat) => rowLabel(seat) === row)
                  .sort(
                    (a, b) => a.seatNumber - b.seatNumber
                  );

                return (
                  <div
                    key={row}
                    className={styles.seatRow}
                  >
                    <strong className={styles.rowLabel}>
                      {row}
                    </strong>

                    {rowSeats.map((seat) => {
                      const selected = selectedIds.includes(
                        seat.performanceSeatId
                      );

                      const unavailable =
                        seat.status !== "AVAILABLE" ||
                        !validPrice(seat.price);

                      return (
                        <button
                          key={seat.performanceSeatId}
                          type="button"
                          className={[
                            styles.seat,
                            selected
                              ? styles.selectedSeat
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            "--seat-color": gradeColor(
                              seat.gradeName
                            ),
                            gridColumn: seat.seatNumber + 1,
                          }}
                          disabled={disabled || unavailable}
                          aria-pressed={selected}
                          aria-label={[
                            `${row}열 ${seat.seatNumber}번`,
                            gradeLabel(seat.gradeName),
                            money(seat.price),
                            STATUS_LABELS[seat.status] ??
                            "선택 불가",
                          ].join(", ")}
                          onClick={() => onToggle(seat)}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}