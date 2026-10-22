import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  createOrder,
  SeatApiError,
} from "../seat/seatApi";

import styles from "../seat/SeatSelect.module.css";

import {
  rememberHold,
  forgetHold,
  releasePendingHold,
  seatPath,
  loginPath,
} from "../seat/seatFlow";

export default function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;
  const order = booking?.order;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);

  const requestLock = useRef(false);

  const validBooking =
    booking?.performanceId &&
    typeof booking?.holdToken === "string" &&
    booking.holdToken.trim() &&
    Array.isArray(booking?.performanceSeatIds) &&
    booking.performanceSeatIds.length > 0 &&
    booking.performanceSeatIds.length <= 5;

  useEffect(() => {
    if (!validBooking) return;

    if (order) {
      // 주문이 생성된 후에는 선점 취소 대상에서 제외
      forgetHold(booking.holdToken);
    } else {
      rememberHold(booking);
    }
  }, [booking, order, validBooking]);

  async function backToSeats() {
    if (requestLock.current || busy || order) return;

    requestLock.current = true;
    setBusy(true);
    setError("");

    try {
      // 기존 화면에서 넘어온 데이터도 보관한 뒤 정리
      rememberHold(booking);

      const released = await releasePendingHold();

      navigate(seatPath(booking.performanceId), {
        replace: true,
        state: {
          holdNotice: released
            ? ""
            : "주문에 연결됐거나 상태가 변경된 좌석은 해제하지 않았습니다.",
        },
      });
    } catch (returnError) {
      setErrorStatus(returnError.status ?? 0);
      setError(
        returnError.message ||
          "선점을 해제하지 못했습니다. 다시 시도해 주세요."
      );
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  function returnButton(status = 0) {
    return (
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={busy}
        onClick={() => {
          if (status === 401) {
            rememberHold(booking);

            navigate(loginPath(booking.performanceId), {
              replace: true,
            });
          } else {
            backToSeats();
          }
        }}
      >
        {status === 401
          ? "로그인하러 가기"
          : "좌석 다시 선택"}
      </button>
    );
  }

  async function submitOrder() {
    if (
      !validBooking ||
      order ||
      booking.orderAttempted ||
      requestLock.current
    ) {
      return;
    }

    if (!paymentMethod) {
      setError("결제수단을 선택해 주세요.");
      return;
    }

    requestLock.current = true;
    setBusy(true);
    setErrorStatus(0);
    setError("");

    // 요청 도중 새로고침해도 바로 중복 요청하지 않도록 기록
    navigate("/payment/checkout", {
      replace: true,
      state: {
        ...booking,
        orderAttempted: true,
      },
    });

    try {
      const createdOrder = await createOrder({
        performanceId: booking.performanceId,
        performanceSeatIds: booking.performanceSeatIds,
        holdToken: booking.holdToken,
        paymentMethod,
      });

      if (
        !createdOrder?.ordersId ||
        !createdOrder?.orderNo
      ) {
        throw new SeatApiError(
          "주문 생성 결과를 확인하지 못했습니다.",
          0,
          true
        );
      }

      navigate("/payment/checkout", {
        replace: true,
        state: {
          ...booking,
          orderAttempted: false,
          order: createdOrder,
        },
      });
    } catch (requestError) {
      setErrorStatus(requestError.status ?? 0);

      const uncertain =
        !(requestError instanceof SeatApiError) ||
        requestError.uncertain;

      if (uncertain) {
        setError(
          "주문 처리 결과를 확인하지 못했습니다. 중복 요청을 막기 위해 주문 내역을 먼저 확인해 주세요."
        );
      } else {
        // 서버가 요청을 명확히 거절했다면 다시 시도 가능
        navigate("/payment/checkout", {
          replace: true,
          state: {
            ...booking,
            orderAttempted: false,
          },
        });

        setError(requestError.message);
      }
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  if (!validBooking) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1>선택한 좌석 정보가 없습니다.</h1>

          <a href="http://localhost/concert/list">
            공연 목록으로 이동
          </a>
        </div>
      </main>
    );
  }

  if (order) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1>주문이 생성되었습니다.</h1>
          <p>현재 결제 대기 상태입니다.</p>

          <section className={styles.sidebar}>
            <h2>주문 정보</h2>

            <div className={styles.priceRow}>
              <span>주문 번호</span>
              <strong>{order.orderNo}</strong>
            </div>

            <div className={styles.total}>
              <strong>결제 예정 금액</strong>

              <strong>
                {Number(order.totalAmount).toLocaleString(
                  "ko-KR"
                )}
                원
              </strong>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>
          SIST TICKET
        </span>

        <h1>예매 확인</h1>

        <section className={styles.sidebar}>
          <h2>선택한 예매 정보</h2>

          <div className={styles.priceRow}>
            <span>공연 회차</span>
            <strong>#{booking.performanceId}</strong>
          </div>

          <div className={styles.priceRow}>
            <span>선택한 좌석</span>
            <strong>
              {booking.performanceSeatIds.length}매
            </strong>
          </div>

          {typeof booking.holdExpiresAt === "string" && (
            <p className={styles.muted}>
              선점 만료:{" "}
              {booking.holdExpiresAt
                .replace("T", " ")
                .slice(0, 19)}
            </p>
          )}

          {error && (
            <div className={styles.error} role="alert">
              <p>{error}</p>
              {returnButton(errorStatus)}
            </div>
          )}

          {booking.orderAttempted && !busy && !error && (
            <div className={styles.error} role="alert">
              <p>
                이전 주문 요청의 결과 확인이 필요합니다.
                주문이 생성된 좌석은 자동으로 해제되지 않습니다.
              </p>

              {returnButton()}
            </div>
          )}

          <label htmlFor="payment-method">
            결제수단
          </label>

          <select
            id="payment-method"
            className={styles.dateToggle}
            style={{
              width: "100%",
              marginBottom: "16px",
            }}
            value={paymentMethod}
            disabled={busy || booking.orderAttempted}
            onChange={(event) =>
              setPaymentMethod(event.target.value)
            }
          >
            <option value="">선택해 주세요</option>
            <option value="CARD">카드</option>
          </select>

          <button
            type="button"
            className={styles.payButton}
            disabled={
              busy ||
              booking.orderAttempted ||
              !paymentMethod
            }
            onClick={submitOrder}
          >
            {busy ? "처리 중..." : "주문 생성하기"}
          </button>
          {!error && !booking.orderAttempted && (
            <div style={{ marginTop: "12px" }}>
              {returnButton()}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}