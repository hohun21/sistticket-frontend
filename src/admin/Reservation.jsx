import { useEffect, useState } from "react";
import "./Reservation.css";

function Reservation() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 상세 정보를 펼쳐 볼 예매
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [reservationDetail, setReservationDetail] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");

    // 전체 예매 목록 조회
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "http://localhost/api/admin/reservations",
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(`예매 내역 조회 실패 (${response.status})`);
                }

                const data = await response.json();
                setReservations(Array.isArray(data) ? data : data.content ?? []);
            } catch (err) {
                console.error("예매 내역 조회 오류:", err);
                setError(err.message || "예매 내역을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        void fetchReservations();
    }, []);

    // 예매 한 건의 상세 조회
    const openReservationDetail = async (reservation) => {
        setSelectedReservation(reservation);
        setReservationDetail([]);
        setDetailError("");

        const reservationId = reservation.ordersId;
        if (reservationId == null) {
            setDetailError("예매 ID를 찾을 수 없습니다.");
            setDetailLoading(false);
            return;
        }

        setDetailLoading(true);

        try {
            const response = await fetch(
                `http://localhost/api/admin/reservations/${encodeURIComponent(reservationId)}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`예매 상세 조회 실패 (${response.status})`);
            }

            const data = await response.json();
            const details = Array.isArray(data) ? data : data ? [data] : [];

            // API 결과에 같은 좌석이 중복되어 있으면 한 번만 표시
            const uniqueDetails = Array.from(
                new Map(
                    details.map((detail, index) => {
                        const performanceSeq =
                            detail.performanceSeq ?? detail.performancesSeq ?? "";
                        const rowLabel = detail.rowLabel ?? "";
                        const seatNumber = detail.seatNumber ?? "";
                        const hasSeatIdentity = rowLabel !== "" || seatNumber !== "";
                        const key = hasSeatIdentity
                            ? `${performanceSeq}|${rowLabel}|${seatNumber}`
                            : `detail-${index}`;

                        return [key, detail];
                    })
                ).values()
            );

            setReservationDetail(uniqueDetails);
        } catch (err) {
            console.error("예매 상세 조회 오류:", err);
            setDetailError(err.message || "상세 정보를 불러오지 못했습니다.");
        } finally {
            setDetailLoading(false);
        }
    };

    // 선택된 예매를 다시 클릭하면 접고, 다른 예매를 누르면 해당 상세를 펼침
    const toggleReservationDetail = (reservation) => {
        if (
            selectedReservation &&
            String(selectedReservation.ordersId) === String(reservation.ordersId)
        ) {
            closeReservationDetail();
            return;
        }

        void openReservationDetail(reservation);
    };

    const closeReservationDetail = () => {
        setSelectedReservation(null);
        setReservationDetail([]);
        setDetailError("");
        setDetailLoading(false);
    };

    const formatPrice = (price) => {
        return `₩${Number(price ?? 0).toLocaleString("ko-KR")}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return date;

        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
            .format(parsedDate)
            .replace(/\. /g, ".")
            .replace(/\.$/, "");
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "결제 완료":
            case "PAID":
            case "CONFIRMED":
                return "status-completed";
            case "결제 대기":
            case "PENDING":
                return "status-pending";
            case "취소":
            case "CANCELLED":
                return "status-cancelled";
            case "환불 완료":
            case "REFUNDED":
                return "status-refunded";
            default:
                return "status-pending";
        }
    };

    if (loading) {
        return <div className="reservation-message">예매 내역을 불러오는 중...</div>;
    }

    if (error) {
        return (
            <div className="reservation-message reservation-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
        );
    }

    return (
        <div className="reservation-page">
            <div className="reservation-header">
                <div>
                    <h2>예매 관리</h2>
                    <p>전체 회원의 예매 내역을 확인할 수 있습니다.</p>
                </div>
                <span className="reservation-count">총 {reservations.length}건</span>
            </div>

            <div className="reservation-list">
                {reservations.length === 0 ? (
                    <div className="reservation-empty">등록된 예매 내역이 없습니다.</div>
                ) : (
                    reservations.map((reservation) => {
                        const reservationKey =
                            reservation.ordersId ?? reservation.orderNo;
                        const isSelected =
                            selectedReservation != null &&
                            String(selectedReservation.ordersId) ===
                            String(reservation.ordersId);

                        return (
                            <div className="reservation-order-group" key={reservationKey}>
                                {/* 예매 목록 행 */}
                                <div
                                    className={`reservation-item${isSelected ? " reservation-item-selected" : ""}`}
                                    onClick={() => toggleReservationDetail(reservation)}
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={isSelected}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleReservationDetail(reservation);
                                        }
                                    }}
                                >
                                    <div className="reservation-member">
                                        <div className="reservation-avatar">
                                            {(reservation.memberName ?? "?").charAt(0)}
                                        </div>
                                        <div className="reservation-member-info">
                                            <span className="reservation-member-name">
                                                {reservation.memberName ?? "이름 없음"}
                                            </span>
                                            <span className="reservation-number">
                                                {reservation.orderNo}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="reservation-concert">
                                        {reservation.concertsName ?? "공연명 없음"}
                                    </div>
                                    <div className="reservation-date">
                                        {formatDate(reservation.createdAt)}
                                    </div>
                                    <div className="reservation-price">
                                        {formatPrice(reservation.totalAmount)}
                                    </div>
                                </div>

                                {/* 상세 정보가 선택한 예매 행 바로 아래에서 펼쳐짐 */}
                                {isSelected && (
                                    <section className="reservation-detail-panel">
                                        <div className="reservation-detail-header">

                                        </div>

                                        {detailLoading ? (
                                            <div className="reservation-message">
                                                상세 정보를 불러오는 중...
                                            </div>
                                        ) : detailError ? (
                                            <div className="reservation-error">
                                                <p>{detailError}</p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void openReservationDetail(reservation)
                                                    }
                                                >
                                                    다시 시도
                                                </button>
                                            </div>
                                        ) : reservationDetail.length > 0 ? (
                                            <div className="reservation-detail-list">
                                                {reservationDetail.map((detail, index) => (
                                                    <div
                                                        className="reservation-detail-card"
                                                        key={`${reservationKey}-${detail.performanceSeq ?? detail.performancesSeq ?? ""}-${detail.rowLabel ?? ""}-${detail.seatNumber ?? index}`}
                                                    >
                                                        <div className="reservation-detail-cell">
                                                            <span>좌석 등급</span>
                                                            <strong>
                                                                {detail.gradeName ??
                                                                    detail.seatGrade ??
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div className="reservation-detail-cell">
                                                            <span>회차</span>
                                                            <strong>
                                                                {detail.performanceSeq != null ||
                                                                detail.performancesSeq != null
                                                                    ? `${detail.performanceSeq ?? detail.performancesSeq}회차`
                                                                    : "-"}
                                                            </strong>
                                                        </div>

                                                        <div className="reservation-detail-cell">
                                                            <span>좌석</span>
                                                            <strong>
                                                                {detail.rowLabel != null ||
                                                                detail.seatNumber != null
                                                                    ? `${detail.rowLabel ?? ""}열 ${detail.seatNumber ?? ""}번`
                                                                    : "-"}
                                                            </strong>
                                                        </div>

                                                        <div className="reservation-detail-cell">
                                                            <span>가격</span>
                                                            <strong>{formatPrice(detail.price)}</strong>
                                                        </div>

                                                        <div className="reservation-detail-cell">
                                                            <span>상태</span>
                                                            <strong>
                                                                <span
                                                                    className={`reservation-status ${getStatusClass(detail.status)}`}
                                                                >
                                                                    {detail.status ?? "상태 미확인"}
                                                                </span>
                                                            </strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="reservation-empty">
                                                조회된 상세 정보가 없습니다.
                                            </p>
                                        )}
                                    </section>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Reservation;
