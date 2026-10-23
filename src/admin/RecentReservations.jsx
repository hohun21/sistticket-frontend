import { useEffect, useState } from "react";
import { formatCurrency } from "./adminData";
import {useNavigate} from "react-router-dom";

function RecentReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const controller = new AbortController();

        const fetchRecentReservations = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "/api/admin/reservations",
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `최근 예매 내역 조회 실패 (${response.status})`
                    );
                }

                const data = await response.json();

                setReservations(
                    Array.isArray(data) ? data : data.content ?? []
                );
            } catch (err) {
                if (err.name === "AbortError") return;

                console.error("최근 예매 내역 조회 오류:", err);
                setError(
                    err.message || "최근 예매 내역을 불러오지 못했습니다."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void fetchRecentReservations();

        return () => controller.abort();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(parsedDate);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "결제 완료":
            case "CONFIRMED":
                return "paid";

            case "결제 대기":
            case "PENDING":
                return "pending";

            case "취소 완료":
            case "CANCELLED":
                return "cancelled";

            default:
                return "pending";
        }
    };



    return (
        <article className="admin-panel reservation-panel">
            <div className="admin-panel-heading">
                <div>
                    <h3>최근 예매 내역</h3>
                    <p>최근 예매 현황을 확인하세요.</p>
                </div>
                <button
                    type="button"
                    className="admin-panel-label"
                    onClick={() => navigate("/admin/reservations")}
                >
                    더 보기
                </button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>회원명</th>
                        <th>공연명</th>
                        <th>예매 일시</th>
                        <th>결제 금액</th>

                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="admin-table-message">
                                최근 예매 내역을 불러오는 중...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="admin-table-message"
                            >
                                {error}
                            </td>
                        </tr>
                    ) : reservations.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="admin-table-message"
                            >
                                예매 내역이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        reservations.slice(0,5).map((reservation) => (
                            <tr
                                key={
                                    reservation.ordersId ??
                                    reservation.orderNo
                                }
                            >
                                <td>
                                    <div className="reservation-customer">
                                        <div className="customer-avatar">
                                            {(
                                                reservation.memberName ??
                                                "?"
                                            ).charAt(0)}
                                        </div>

                                        <div>
                                            <strong>
                                                {reservation.memberName ??
                                                    "이름 없음"}
                                            </strong>
                                            <span>
                                                    {reservation.orderNo ?? "-"}
                                                </span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    {reservation.concertsName ??
                                        "공연명 없음"}
                                </td>

                                <td className="reservation-date">
                                    {formatDate(reservation.createdAt)}
                                </td>

                                <td className="reservation-amount">
                                    {formatCurrency(
                                        reservation.totalAmount ?? 0
                                    )}
                                </td>

                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </article>
    );
}

export default RecentReservations;