
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PaymentResult.module.css";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { booking, order, payment, scenario } = location.state || {};

  if (!payment) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1>결제 결과를 확인할 수 없습니다.</h1>
          <button
            type="button"
            className={styles.payButton}
            onClick={() => navigate("/concert/list")}
          >
            공연 목록으로 이동
          </button>
        </div>
      </main>
    );
  }

  const success = payment.status === "SUCCESS";
  const failed = payment.status === "FAILED";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>SIST TICKET</span>

        <h1>
          {success
            ? "모의 결제가 성공했습니다."
            : failed
              ? "모의 결제에 실패했습니다."
              : `결제 상태: ${payment.status}`}
        </h1>

        <p>
          발표용 모의 결제 결과입니다. 실제 카드 결제는 발생하지 않았습니다.
        </p>

        <section className={styles.sidebar}>
          <h2>결제 결과</h2>

          <div className={styles.priceRow}>
            <span>주문 번호</span>
            <strong>{order?.orderNo || "-"}</strong>
          </div>

          <div className={styles.priceRow}>
            <span>결제 ID</span>
            <strong>{payment.paymentId}</strong>
          </div>

          <div className={styles.priceRow}>
            <span>결제 수단</span>
            <strong>{payment.paymentMethod || "-"}</strong>
          </div>

          <div className={styles.priceRow}>
            <span>결제 상태</span>
            <strong>{payment.status}</strong>
          </div>

          <div className={styles.total}>
            <strong>결제 금액</strong>
            <strong>
              {Number(payment.amount || 0).toLocaleString("ko-KR")}원
            </strong>
          </div>

          {payment.paidAt && (
            <p className={styles.muted}>
              처리 시각: {payment.paidAt.replace("T", " ")}
            </p>
          )}

          {failed && (
            <button
              type="button"
              className={styles.payButton}
              onClick={() =>
                navigate("/payment/checkout", {
                  replace: true,
                  state: {
                    ...booking,
                    order,
                    payment,
                  },
                })
              }
            >
              결제 재시도 화면으로 이동
            </button>
          )}

         
            <div className={styles.buttonGroup}>
            <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate("/")}
            >
                홈으로 이동
            </button>

            <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate("/mypage")}
            >
                마이페이지로 이동
            </button>
            </div>


        </section>
      </div>
    </main>
  );
}
