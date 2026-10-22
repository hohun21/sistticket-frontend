import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import SeatSelect from "./SeatSelect";
import { holdSeats, SeatApiError } from "./seatApi";
import {
  rememberHold,
  releasePendingHold,
  loginPath,
} from "./seatFlow";

import styles from "./SeatSelect.module.css";

export default function SeatBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const performanceId = new URLSearchParams(
    location.search
  ).get("performanceId");

  const requestLock = useRef(false);

  const [blocked, setBlocked] = useState(false);
  const [retry, setRetry] = useState(0);
  const [gate, setGate] = useState({
    key: null,
    error: null,
    notice: "",
  });

  useEffect(() => {
    let active = true;

    setBlocked(false);
    setGate({ key: null, error: null, notice: "" });

    releasePendingHold()
      .then((released) => {
        if (!active) return;

        setGate({
          key: location.key,
          error: null,
          notice: released
            ? ""
            : "주문에 연결됐거나 상태가 변경된 좌석은 해제하지 않았습니다.",
        });
      })
      .catch((error) => {
        if (!active) return;

        setGate({
          key: null,
          error,
          notice: "",
        });
      });

    return () => {
      active = false;
    };
  }, [location.key, retry]);

  async function handleCheckout({
    performanceId,
    performanceSeq,
    performanceSeatIds,
  }) {
    if (blocked || requestLock.current) {
      throw new Error("이전 요청의 결과를 확인해 주세요.");
    }

    if (
      !Array.isArray(performanceSeatIds) ||
      performanceSeatIds.length === 0 ||
      performanceSeatIds.length > 5
    ) {
      throw new Error("좌석은 1~5매 선택해 주세요.");
    }

    requestLock.current = true;

    try {
      const hold = await holdSeats(
        performanceId,
        performanceSeatIds
      );

      if (
        typeof hold?.holdToken !== "string" ||
        !hold.holdToken.trim()
      ) {
        throw new SeatApiError(
          "좌석 선점 결과를 확인하지 못했습니다.",
          0,
          true
        );
      }

      const booking = {
        performanceId,
        performanceSeq,
        performanceSeatIds,
        holdToken: hold.holdToken,
        holdExpiresAt: hold.holdExpiresAt,
      };

      rememberHold(booking);

      navigate("/payment/checkout", {
        state: booking,
      });
    } catch (error) {
      if (error.uncertain) {
        setBlocked(true);
      }

      throw error;
    } finally {
      requestLock.current = false;
    }
  }

  if (gate.error) {
    const needsLogin = gate.error.status === 401;

    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1>좌석 선택</h1>

          <div className={styles.error} role="alert">
            <p>
              {gate.error.message ||
                "이전 선점을 정리하지 못했습니다."}
            </p>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                if (needsLogin) {
                  navigate(loginPath(performanceId), {
                    replace: true,
                  });
                } else {
                  setRetry((value) => value + 1);
                }
              }}
            >
              {needsLogin
                ? "로그인하러 가기"
                : "좌석 다시 선택"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (gate.key !== location.key) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p>좌석 정보를 준비하고 있습니다.</p>
        </div>
      </main>
    );
  }

  const notice =
    gate.notice || location.state?.holdNotice;

  return (
    <>
      {notice && (
        <div className={styles.error} role="status">
          {notice}
        </div>
      )}

      <SeatSelect
        key={location.key}
        onCheckout={blocked ? undefined : handleCheckout}
      />
    </>
  );
}