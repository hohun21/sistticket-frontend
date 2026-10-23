
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createOrder,
  completePayment,
  failPayment,
  retryPayment,
  SeatApiError,
} from "../seat/seatApi";
import {} from "../seat/SeatBooking"

import styles from "./PaymentCheckout.module.css";

import {
  rememberHold,
  forgetHold,
  releasePendingHold,
  seatPath,
  loginPath,
} from "../seat/seatFlow";

const PAYMENT_RESULT_PATH = "/payment/result";

export default function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;
  const order = booking?.order;
  const payment = booking?.payment;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [scenario, setScenario] = useState("SUCCESS");
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
      rememberHold(booking);

      const released = await releasePendingHold();

      navigate(seatPath(booking.performanceId), {
        replace: true,
        state: {
          holdNotice: released
            ? ""
            : "좌석 상태가 변경되어 선점을 해제하지 못했습니다.",
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
        {status === 401 ? "로그인하러 가기" : "좌석 다시 선택"}
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
    setError("");
    setErrorStatus(0);

    navigate("/payment/checkout", {
      replace: true,
      state: { ...booking, orderAttempted: true },
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
        !createdOrder?.orderNo ||
        !createdOrder?.paymentId
      ) {
        throw new SeatApiError(
          "주문 또는 결제 ID를 확인하지 못했습니다. 서버 응답을 확인해 주세요.",
          0,
          true
        );
      }

      const nextBooking = {
        ...booking,
        orderAttempted: false,
        order: createdOrder,
        payment: null,
      };

      navigate("/payment/checkout", {
        replace: true,
        state: nextBooking,
      });

      setPaymentMethod(paymentMethod);
    } catch (requestError) {
      setErrorStatus(requestError.status ?? 0);

      const uncertain =
        !(requestError instanceof SeatApiError) ||
        requestError.uncertain;

      if (uncertain) {
        setError(
          "주문 처리 결과를 확인하지 못했습니다. 중복 주문 방지를 위해 주문 내역을 확인해 주세요."
        );
      } else {
        navigate("/payment/checkout", {
          replace: true,
          state: { ...booking, orderAttempted: false },
        });
        setError(requestError.message);
      }
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  async function processPayment(action) {
    if (!order?.paymentId || requestLock.current || busy) return;

    requestLock.current = true;
    setBusy(true);
    setError("");
    setErrorStatus(0);

    try {
      let result;

      if (action === "SUCCESS") {
        result = await completePayment(order.paymentId);
      } else if (action === "FAIL") {
        result = await failPayment(order.paymentId);
      } else if (action === "RETRY") {
        result = await retryPayment(order.paymentId);
      }

      if (!result?.paymentId || !result?.status) {
        throw new SeatApiError(
          "결제 응답을 확인하지 못했습니다.",
          0,
          true
        );
      }

      if (action === "RETRY") {
        setError("");
        setErrorStatus(0);

        navigate("/payment/checkout", {
          replace: true,
          state: {
            ...booking,
            payment: result,
          },
        });
      } else {
        navigate(PAYMENT_RESULT_PATH, {
          replace: true,
          state: {
            booking,
            order,
            payment: result,
            scenario: action,
          },
        });
      }
    } catch (paymentError) {
      setErrorStatus(paymentError.status ?? 0);
      setError(
        paymentError.message ||
          "결제 처리에 실패했습니다. 상태를 확인한 후 다시 시도해 주세요."
      );
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  async function processPayment(action) {
    if (!order?.paymentId || requestLock.current || busy) {
      return;
    }

    requestLock.current = true;
    setBusy(true);
    setError("");
    setErrorStatus(0);

    try {
      let result;

      if (action === "SUCCESS") {
        result = await completePayment(order.paymentId);
      } else if (action === "FAIL") {
        result = await failPayment(order.paymentId);
      } else if (action === "RETRY") {
        result = await retryPayment(order.paymentId);
      } else {
        return;
      }

      if (!result?.paymentId || !result?.status) {
        throw new SeatApiError(
          "결제 응답을 확인하지 못했습니다.",
          0,
          true
        );
      }

      if (action === "RETRY") {
        navigate("/payment/checkout", {
          replace: true,
          state: {
            ...booking,
            payment: result,
          },
        });
      } else {
        navigate("/payment/result", {
          replace: true,
          state: {
            booking,
            order,
            payment: result,
            scenario: action,
          },
        });
      }
    } catch (paymentError) {
      setErrorStatus(paymentError.status ?? 0);
      setError(
        paymentError.message ||
          "결제 처리에 실패했습니다. 상태를 확인한 후 다시 시도해 주세요."
      );
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
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate("/concert/list")}
          >
            공연 목록으로 이동
          </button>
        </div>
      </main>
    );
  }

  if (order) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>SIST TICKET</span>
          <h1>결제 진행</h1>
          <p>발표용 모의 결제입니다. 실제 금액이 청구되지 않습니다.</p>

          <section className={styles.sidebar}>
            <h2>주문 정보</h2>

            <div className={styles.priceRow}>
              <span>주문 번호</span>
              <strong>{order.orderNo}</strong>
            </div>

            <div className={styles.priceRow}>
              <span>결제 ID</span>
              <strong>{order.paymentId}</strong>
            </div>

            <div className={styles.total}>
              <strong>결제 예정 금액</strong>
              <strong>
                {Number(order.totalAmount).toLocaleString("ko-KR")}원
              </strong>
            </div>
            <label htmlFor="payment-scenario">결제 시나리오</label>
            <select
              id="payment-scenario"
              className={styles.dateToggle}
              style={{ width: "100%", marginBottom: 16 }}
              value={scenario}
              disabled={busy || payment?.status === "SUCCESS"}
              onChange={(event) => setScenario(event.target.value)}
            >
              <option value="SUCCESS">결제 성공</option>
              <option value="FAIL">결제 실패</option>
            </select>

            {error && (
              <div className={styles.error} role="alert">
                <p>{error}</p>
                {errorStatus === 401 && returnButton(401)}
              </div>
            )}

            {payment?.status === "FAILED" && (
              <div className={styles.error} role="status">
                <p>결제가 실패했습니다. 재시도할 수 있습니다.</p>
                <button
                  type="button"
                  className={styles.payButton}
                  disabled={busy}
                  onClick={() => processPayment("RETRY")}
                >
                  결제 재시도
                </button>
              </div>
            )}

            {payment?.status === "PENDING" && (
              <p className={styles.muted}>
                결제 상태: 대기 중
              </p>
            )}

            <button
              type="button"
              className={styles.payButton}
              disabled={
                busy ||
                payment?.status === "SUCCESS" ||
                payment?.status === "CANCELLED"
              }
              onClick={() => processPayment(scenario)}
            >
              {busy
                ? "처리 중..."
                : scenario === "SUCCESS"
                  ? "모의 결제 성공"
                  : "모의 결제 실패"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>SIST TICKET</span>
        <h1>예매 확인</h1>

        <section className={styles.sidebar}>
          <h2>선택한 예매 정보</h2>

          <div className={styles.priceRow}>
            <span>공연 회차</span>
            <strong>
              {booking.performanceSeq ?? "-"}회차
            </strong>
          </div>

          <div className={styles.priceRow}>
            <span>선택한 좌석</span>
            <strong>{booking.performanceSeatIds.length}매</strong>
          </div>

          {typeof booking.holdExpiresAt === "string" && (
            <p className={styles.muted}>
              선점 만료:{" "}
              {booking.holdExpiresAt.replace("T", " ").slice(0, 19)}
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
                중복 요청 방지를 위해 주문 내역을 확인해 주세요.
              </p>
              {returnButton()}
            </div>
          )}

          <label htmlFor="payment-method">결제수단</label>
          <select
            id="payment-method"
            className={styles.dateToggle}
            style={{ width: "100%", marginBottom: 16 }}
            value={paymentMethod}
            disabled={busy || booking.orderAttempted}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="">선택해 주세요</option>
            <option value="CARD">카드 (모의 결제)</option>
            <option value="BANK_TRANSFER" disabled>
              계좌이체 (준비 중)
            </option>
          </select>

          <button
            type="button"
            className={styles.payButton}
            disabled={busy || booking.orderAttempted || !paymentMethod}
            onClick={submitOrder}
          >
            {busy ? "처리 중..." : "주문 생성하기"}
          </button>

          {!error && !booking.orderAttempted && (
            <div style={{ marginTop: 12 }}>
              {returnButton()}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
