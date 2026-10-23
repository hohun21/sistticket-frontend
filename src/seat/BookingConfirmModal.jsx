
import styles from "./BookingConfirmModal.module.css";

function BookingConfirmModal({
  isOpen,
  selectedSeats = [],
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const totalPrice = selectedSeats.reduce(
    (total, seat) => total + (Number(seat.price) || 0),
    0
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="booking-confirm-title">예매 정보를 확인해 주세요</h2>

        <div className={styles.seatInfo}>
          <h3>선택한 좌석 ({selectedSeats.length}매)</h3>

          {selectedSeats.length > 0 ? (
            <ul>
              {selectedSeats.map((seat) => (
                <li key={seat.id}>
                  <div>
                    <strong>{seat.seatName}</strong>
                    <span>{seat.gradeName}</span>
                  </div>
                  <strong>
                    {(Number(seat.price) || 0).toLocaleString("ko-KR")}원
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>선택된 좌석이 없습니다.</p>
          )}
        </div>

        <div className={styles.total}>
          <span>총 결제 금액</span>
          <strong>{totalPrice.toLocaleString("ko-KR")}원</strong>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={selectedSeats.length === 0}
          >
            예매 진행
          </button>
        </div>
      </section>
    </div>
  );
}

export default BookingConfirmModal;
