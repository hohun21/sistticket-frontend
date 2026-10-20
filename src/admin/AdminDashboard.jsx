import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import RecentReservations from "./RecentReservations";
import ConcertList from "./ConcertList";
import { formatCurrency, formatNumber } from "./adminData";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/admin/dashboard", {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP 오류: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setDashboard(data);
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error("대시보드 조회 실패:", err);
                setError(err.message || "대시보드를 불러오지 못했습니다.");
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    const stats = [
        {
            label: "총 예매 건수",
            value: dashboard ? formatNumber(dashboard.totalReservations) : "—",
            icon: "▤",
            color: "violet",
            description: "누적 예매 내역",
        },
        {
            label: "가입 회원",
            value: dashboard ? formatNumber(dashboard.totalMembers) : "—",
            icon: "♙",
            color: "blue",
            description: "전체 회원 수",
        },
        {
            label: "등록 공연",
            value: dashboard ? formatNumber(dashboard.totalConcerts) : "—",
            icon: "♫",
            color: "orange",
            description: "전체 등록 공연",
        },
        {
            label: "누적 매출",
            value: dashboard ? formatCurrency(dashboard.totalRevenue) : "—",
            icon: "₩",
            color: "green",
            description: "누적 결제 금액",
        },
    ];

    return (
        <>
            {error && (
                <div className="admin-error">
                    대시보드 조회 실패: {error}
                </div>
            )}

            <section className="admin-page-heading">
                <div>
                    <div className="admin-eyebrow">SISTICKET MANAGEMENT</div>
                    <h2>대시보드</h2>
                    <p>SistTicket의 운영 현황을 한눈에 확인하세요.</p>
                </div>

                <div className="admin-today">
                    <span className="admin-calendar-icon">▦</span>
                    {new Date().toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                    })}
                </div>
            </section>

            <section className="admin-welcome">
                <div className="admin-welcome-content">
                    <span className="admin-welcome-label">ADMIN DASHBOARD</span>
                    <h3>오늘의 티켓팅 운영 현황</h3>
                    <p>
                        공연, 예매, 회원 및 매출 현황을 확인하고 관리할 수 있습니다.
                    </p>
                </div>

                <div className="admin-welcome-art">
                    <div className="welcome-circle circle-one" />
                    <div className="welcome-circle circle-two" />
                    <div className="welcome-ticket">
                        <span>♪</span>
                        <strong>SISTICKET</strong>
                        <small>YOUR NEXT STAGE</small>
                    </div>
                </div>
            </section>

            <section className="admin-stats-grid">
                {stats.map((stat) => (
                    <StatCard key={stat.label} stat={stat} loading={loading} />
                ))}
            </section>

            <section className="admin-dashboard-grid">
                <RecentReservations />
                <ConcertList />
            </section>

            <footer className="admin-footer">
                <span>© 2026 SISTICKET</span>
                <span>ADMIN MANAGEMENT SYSTEM</span>
            </footer>
        </>
    );
}

export default AdminDashboard;
