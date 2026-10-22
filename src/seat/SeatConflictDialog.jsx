import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import styles from "./SeatConflictDialog.module.css";

export default function SeatConflictDialog({
  open,
  onConfirm,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [open]);

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onConfirm();
      }}
    >
      <div className={styles.icon} aria-hidden="true">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <path
            d="M12 7.5V12.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle
            cx="12"
            cy="16"
            r="1"
            fill="currentColor"
          />
        </svg>
      </div>

      <p className={styles.eyebrow}>
        좌석 선택 안내
      </p>

      <h2 id={titleId} className={styles.title}>
        이미 선택된 좌석입니다.
      </h2>

      <p
        id={descriptionId}
        className={styles.description}
      >
        다른 사용자가 먼저 선택한 좌석입니다.
        <br />
        확인을 누르면 최신 좌석 정보를 불러옵니다.
      </p>

      <button
        type="button"
        className={styles.confirmButton}
        onClick={onConfirm}
      >
        확인
      </button>
    </dialog>,
    document.body
  );
}