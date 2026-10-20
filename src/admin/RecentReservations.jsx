import { formatCurrency, recentReservations } from "./adminData";

function RecentReservations() {
    return (
        <article className="admin-panel reservation-panel">
            <div className="admin-panel-heading">
                <div>
                    <h3>최근 예매 내역</h3>
                    <p>최근 예매 현황을 확인하세요.</p>
                </div>
                <span className="admin-panel-label">SAMPLE</span>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>예매 정보</th>
                            <th>공연명</th>
                            <th>예매 일시</th>
                            <th>결제 금액</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentReservations.map((reservation) => (
                            <tr key={reservation.id}>
                                <td>
                                    <div className="reservation-customer">
                                        <div className="customer-avatar">
                                            {reservation.name.charAt(0)}
                                        </div>
                                        <div>
                                            <strong>{reservation.name}</strong>
                                            <span>{reservation.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{reservation.concert}</td>
                                <td className="reservation-date">{reservation.date}</td>
                                <td className="reservation-amount">
                                    {formatCurrency(reservation.amount)}
                                </td>
                                <td>
                                    <span
                                        className={`reservation-status ${
                                            reservation.status === "결제 완료"
                                                ? "paid"
                                                : reservation.status === "결제 대기"
                                                  ? "pending"
                                                  : "cancelled"
                                        }`}
                                    >
                                        {reservation.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-panel-footnote">
                * 예매 내역은 화면 구성용 샘플이며 실제 DB 데이터가 아닙니다.
            </div>
        </article>
    );
}

export default RecentReservations;
