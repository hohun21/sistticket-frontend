import { useEffect, useState } from "react";
import "./AdminPage.css";

const menuItems = [
    { id: "dashboard", icon: "▦", label: "대시보드" },
    { id: "concerts", icon: "♫", label: "공연 관리" },
    { id: "reservations", icon: "▤", label: "예매 관리" },
    { id: "members", icon: "♙", label: "회원 관리" },
    { id: "revenue", icon: "₩", label: "매출 통계" },
];

const recentReservations = [
    {
        id: "ST-20261018-001",
        name: "김민수",
        concert: "오페라의 유령",
        date: "2026.10.18 14:32",
        amount: 180000,
        status: "결제 완료",
    },
    {
        id: "ST-20261018-002",
        name: "이서연",
        concert: "레미제라블",
        date: "2026.10.18 14:21",
        amount: 150000,
        status: "결제 완료",
    },
    {
        id: "ST-20261018-003",
        name: "박지훈",
        concert: "지킬 앤 하이드",
        date: "2026.10.18 13:58",
        amount: 120000,
        status: "결제 대기",
    },
    {
        id: "ST-20261018-004",
        name: "최유진",
        concert: "레베카",
        date: "2026.10.18 13:41",
        amount: 140000,
        status: "취소 완료",
    },
];

const concertExamples = [
    {
        title: "오페라의 유령",
        location: "샤롯데씨어터",
        period: "2026.10.01 - 2026.12.31",
        category: "MUSICAL",
        color: "purple",
    },
    {
        title: "레미제라블",
        location: "블루스퀘어",
        period: "2026.10.15 - 2027.01.10",
        category: "MUSICAL",
        color: "blue",
    },
    {
        title: "지킬 앤 하이드",
        location: "예술의전당",
        period: "2026.11.01 - 2027.02.28",
        category: "MUSICAL",
        color: "orange",
    },
];

function formatNumber(value) {
    return Number(value ?? 0).toLocaleString("ko-KR");
}

function formatCurrency(value) {
    return `₩${formatNumber(value)}`;
}

function AdminPage() {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        console.log("🔥 사용자 정보 useEffect 실행");
        fetch("/api/admin/dashboard", {
            method: "GET",
            credentials: "include",
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
                console.error("대시보드 조회 실패:", err);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);
    // 추가 useEffect: 로그인 사용자 정보 조회
    function AdminPage() {
        const [currentUser, setCurrentUser] = useState(null);

        useEffect(() => {
            console.log("AdminPage 실행됨");

            fetch("/api/admin/me", {
                method: "GET",
                credentials: "include",
            })
                .then((res) => {
                    console.log("/api/admin/me 상태:", res.status);

                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }

                    return res.json();
                })
                .then((data) => {
                    console.log("로그인 사용자:", data);
                    setCurrentUser(data);
                })
                .catch((err) => console.error("사용자 조회 오류:", err));
        }, []);

        // 기존 코드 유지
    }
    const currentMenu = menuItems.find(
        (item) => item.id === activeMenu
    );

    const stats = [
        {
            label: "총 예매 건수",
            value: dashboard
                ? formatNumber(dashboard.totalReservations)
                : "—",
            icon: "▤",
            color: "violet",
            description: "누적 예매 내역",
        },
        {
            label: "가입 회원",
            value: dashboard
                ? formatNumber(dashboard.totalMembers)
                : "—",
            icon: "♙",
            color: "blue",
            description: "전체 회원 수",
        },
        {
            label: "등록 공연",
            value: dashboard
                ? formatNumber(dashboard.totalConcerts)
                : "—",
            icon: "♫",
            color: "orange",
            description: "전체 등록 공연",
        },
        {
            label: "누적 매출",
            value: dashboard
                ? formatCurrency(dashboard.totalRevenue)
                : "—",
            icon: "₩",
            color: "green",
            description: "누적 결제 금액",
        },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-symbol">S</div>
                    <div>
                        <h1>SISTICKET</h1>
                        <span>ADMIN CONSOLE</span>
                    </div>
                </div>

                <div className="admin-menu-heading">
                    WORKSPACE
                </div>

                <nav className="admin-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`admin-nav-item ${
                                activeMenu === item.id ? "active" : ""
                            }`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className="admin-nav-icon">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {activeMenu === item.id && (
                                <span className="admin-nav-indicator" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-help-icon">?</div>
                    <div>
                        <strong>관리자 센터</strong>
                        <p>SistTicket Management</p>
                    </div>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-breadcrumb">
                        <span>관리자</span>
                        <span className="breadcrumb-divider">/</span>
                        <strong>{currentMenu?.label}</strong>
                    </div>

                    <div className="admin-profile">
                        <div className="admin-profile-status">
                            <span />
                            관리자 모드
                        </div>

                        <div className="admin-avatar">
                            {currentUser?.name?.charAt(0) ||
                                currentUser?.email?.charAt(0) ||
                                "관"}
                        </div>

                        <div className="admin-profile-info">
                            <strong>
                                {currentUser?.name ||
                                    currentUser?.email ||
                                    "불러오는 중..."}
                            </strong>

                            <span>
            {currentUser?.email || "Administrator"}
        </span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {error && (
                        <div className="admin-error">
                            대시보드 조회 실패: {error}
                        </div>
                    )}

                    {activeMenu === "dashboard" ? (
                        <>
                            <section className="admin-page-heading">
                                <div>
                                    <div className="admin-eyebrow">
                                        SISTICKET MANAGEMENT
                                    </div>
                                    <h2>대시보드</h2>
                                    <p>
                                        SistTicket의 운영 현황을 한눈에
                                        확인하세요.
                                    </p>
                                </div>

                                <div className="admin-today">
                                    <span className="admin-calendar-icon">
                                        ▦
                                    </span>
                                    {new Date().toLocaleDateString(
                                        "ko-KR",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            weekday: "long",
                                        }
                                    )}
                                </div>
                            </section>

                            <section className="admin-welcome">
                                <div className="admin-welcome-content">
                                    <span className="admin-welcome-label">
                                        ADMIN DASHBOARD
                                    </span>
                                    <h3>오늘의 티켓팅 운영 현황</h3>
                                    <p>
                                        공연, 예매, 회원 및 매출 현황을
                                        확인하고 관리할 수 있습니다.
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
                                    <article
                                        className="admin-stat-card"
                                        key={stat.label}
                                    >
                                        <div className="admin-stat-top">
                                            <span>{stat.label}</span>
                                            <div
                                                className={`admin-stat-icon ${stat.color}`}
                                            >
                                                {stat.icon}
                                            </div>
                                        </div>

                                        <div className="admin-stat-value">
                                            {loading ? (
                                                <span className="admin-loading">
                                                    불러오는 중...
                                                </span>
                                            ) : (
                                                stat.value
                                            )}
                                        </div>

                                        <div className="admin-stat-description">
                                            <span className="stat-dot" />
                                            {stat.description}
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <section className="admin-dashboard-grid">
                                <article className="admin-panel reservation-panel">
                                    <div className="admin-panel-heading">
                                        <div>
                                            <h3>최근 예매 내역</h3>
                                            <p>
                                                최근 예매 현황을 확인하세요.
                                            </p>
                                        </div>
                                        <span className="admin-panel-label">
                                            SAMPLE
                                        </span>
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
                                            {recentReservations.map(
                                                (reservation) => (
                                                    <tr key={reservation.id}>
                                                        <td>
                                                            <div className="reservation-customer">
                                                                <div className="customer-avatar">
                                                                    {reservation.name.charAt(
                                                                        0
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <strong>
                                                                        {reservation.name}
                                                                    </strong>
                                                                    <span>
                                                                            {reservation.id}
                                                                        </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {reservation.concert}
                                                        </td>
                                                        <td className="reservation-date">
                                                            {reservation.date}
                                                        </td>
                                                        <td className="reservation-amount">
                                                            {formatCurrency(
                                                                reservation.amount
                                                            )}
                                                        </td>
                                                        <td>
                                                                <span
                                                                    className={`reservation-status ${
                                                                        reservation.status ===
                                                                        "결제 완료"
                                                                            ? "paid"
                                                                            : reservation.status ===
                                                                            "결제 대기"
                                                                                ? "pending"
                                                                                : "cancelled"
                                                                    }`}
                                                                >
                                                                    {
                                                                        reservation.status
                                                                    }
                                                                </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="admin-panel-footnote">
                                        * 예매 내역은 화면 구성용 샘플이며
                                        실제 DB 데이터가 아닙니다.
                                    </div>
                                </article>

                                <article className="admin-panel concert-panel">
                                    <div className="admin-panel-heading">
                                        <div>
                                            <h3>공연 현황</h3>
                                            <p>등록 공연 예시</p>
                                        </div>
                                        <span className="concert-count">
                                            {concertExamples.length}
                                        </span>
                                    </div>

                                    <div className="admin-concert-list">
                                        {concertExamples.map((concert) => (
                                            <div
                                                className="admin-concert-item"
                                                key={concert.title}
                                            >
                                                <div
                                                    className={`concert-cover ${concert.color}`}
                                                >
                                                    <span>♫</span>
                                                    <small>
                                                        {concert.category}
                                                    </small>
                                                </div>

                                                <div className="concert-info">
                                                    <strong>
                                                        {concert.title}
                                                    </strong>
                                                    <span>
                                                        {concert.location}
                                                    </span>
                                                    <small>
                                                        {concert.period}
                                                    </small>
                                                </div>

                                                <span className="concert-arrow">
                                                    ›
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="admin-panel-footnote">
                                        * 공연 정보는 화면 구성용 샘플입니다.
                                    </div>
                                </article>
                            </section>

                            <footer className="admin-footer">
                                <span>© 2026 SISTICKET</span>
                                <span>ADMIN MANAGEMENT SYSTEM</span>
                            </footer>
                        </>
                    ) : (
                        <section className="admin-placeholder">
                            <div className="placeholder-icon">
                                {currentMenu?.icon}
                            </div>
                            <span className="admin-eyebrow">
                                SISTICKET MANAGEMENT
                            </span>
                            <h2>{currentMenu?.label}</h2>
                            <p>
                                이 메뉴의 기능은 아직 구현되지 않았습니다.
                                다음 단계에서 연결할 수 있습니다.
                            </p>
                            <button
                                type="button"
                                className="back-dashboard-button"
                                onClick={() => setActiveMenu("dashboard")}
                            >
                                대시보드로 돌아가기
                            </button>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminPage;