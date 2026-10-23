import { useCallback, useEffect, useState } from "react";
import "./Reservation.css";

function Reservation({ menuId = "reservations" }) {
    const isCancellationManagement = menuId === "cancellations";

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // 상세 정보를 펼쳐 볼 예매
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [reservationDetail, setReservationDetail] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    const [cancellationActionLoading, setCancellationActionLoading] = useState(null);

    // 전체 예매 목록 조회. 최초 로딩과 재조회 시 화면 동작을 구분한다.
    const fetchReservations = useCallback(async ({ showLoading = false } = {}) => {
        try {
            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            setError("");

            const response = await fetch(
                isCancellationManagement
                    ? "/api/admin/reservation-cancellations"
                    : "/api/admin/reservations",
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
            setReservations(Array.isArray(data) ? data : data?.content ?? []);
        } catch (err) {
            console.error("예매 내역 조회 오류:", err);
            setError(err.message || "예매 내역을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isCancellationManagement]);

    useEffect(() => {
        void fetchReservations({ showLoading: true });
    }, [fetchReservations, menuId]);

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
                isCancellationManagement
                    ? `/api/admin/reservation-cancellations/${reservationId}`
                    : `/api/admin/reservations/${reservationId}`,
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
            case "CONFIRMED":
                return "status-completed";
            case "PENDING":
                return "status-pending";
            case "CANCELLED":
                return "status-cancelled";
            case "CANCELREQUEST":
                return "status-cancel-request";
            case "EXPIRED":
                return "status-expired";
            default:
                return "status-pending";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "결제 대기";
            case "CONFIRMED":
                return "예매 확정";
            case "CANCELLED":
                return "취소 완료";
            case "CANCELREQUEST":
                return "취소 요청";
            case "EXPIRED":
                return "결제 시간 만료";
            default:
                return "상태 미확인";
        }
    };

    const handleCancellationAction = async (detail, action) => {
        const orderDetailId = detail.ordersDetailId;

        if (orderDetailId == null) {
            alert("주문 상세 ID를 찾을 수 없습니다.");
            return;
        }

        const actionLabel = action === "approve" ? "취소 승인" : "반려";

        if (!window.confirm(`이 취소 요청을 ${actionLabel} 처리하시겠습니까?`)) {
            return;
        }

        try {
            setCancellationActionLoading(orderDetailId);

            const response = await fetch(
                `/api/admin/reservation-cancellations/${orderDetailId}/${action}`,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(
                    message || `${actionLabel} 실패 (${response.status})`
                );
            }

            alert(`${actionLabel} 처리되었습니다.`);

            // 상세 패널을 닫고 서버에서 최신 목록을 다시 받아온다.
            closeReservationDetail();
            await fetchReservations();
        } catch (err) {
            console.error(`${actionLabel} 오류:`, err);
            alert(err.message || `${actionLabel} 처리 중 오류가 발생했습니다.`);
        } finally {
            setCancellationActionLoading(null);
        }
    };

    if (loading) {
        return <div className="reservation-message">예매 내역을 불러오는 중...</div>;
    }

    if (error && reservations.length === 0) {
        return (
            <div className="reservation-message reservation-error">
                <p>{error}</p>
                <button type="button" onClick={() => void fetchReservations({ showLoading: true })}>
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="reservation-page">
            <div className="reservation-header">
                <div>
                    <h2>{isCancellationManagement ? "취소관리" : "예매 관리"}</h2>
                    <p>
                        {isCancellationManagement
                            ? "취소 요청된 예매 내역을 확인할 수 있습니다."
                            : "전체 회원의 예매 내역을 확인할 수 있습니다."}
                    </p>
                </div>
                <div className="reservation-header-actions">
                    <span className="reservation-count">총 {reservations.length}건</span>
                    <button
                        type="button"
                        onClick={() => void fetchReservations()}
                        disabled={refreshing}
                    >
                        {refreshing ? "새로고침 중..." : "목록 새로고침"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="reservation-message reservation-error">
                    <p>{error}</p>
                    <button type="button" onClick={() => void fetchReservations()}>
                        다시 시도
                    </button>
                </div>
            )}

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

                                {isSelected && (
                                    <section className="reservation-detail-panel">
                                        <div className="reservation-detail-header" />

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
                                                                    {getStatusLabel(detail.status)}
                                                                </span>
                                                            </strong>

                                                            {isCancellationManagement &&
                                                                detail.status === "CANCELREQUEST" && (
                                                                    <div className="reservation-cancellation-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="cancellation-approve-button"
                                                                            disabled={cancellationActionLoading !== null}
                                                                            onClick={() =>
                                                                                handleCancellationAction(detail, "approve")
                                                                            }
                                                                        >
                                                                            {cancellationActionLoading === detail.ordersDetailId
                                                                                ? "처리 중..."
                                                                                : "취소 승인"}
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="cancellation-reject-button"
                                                                            disabled={cancellationActionLoading !== null}
                                                                            onClick={() =>
                                                                                handleCancellationAction(detail, "reject")
                                                                            }
                                                                        >
                                                                            {cancellationActionLoading === detail.ordersDetailId
                                                                                ? "처리 중..."
                                                                                : "반려"}
                                                                        </button>
                                                                    </div>
                                                                )}
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
