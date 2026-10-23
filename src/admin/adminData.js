export const adminMenuItems = [
    { id: "dashboard", path: "/admin", icon: "▦", label: "대시보드" },
    { id: "concerts", path: "/admin/settings/main", icon: "♫", label: "공연 관리" },
    { id: "reservations", path: "/admin/reservations", icon: "▤", label: "예매 관리",
    children: [{
        id: "cancellations",
        path: "/admin/reservations/cancellations",
        icon: "↳",
        label: "취소 관리"
    }]},

    { id: "members", path: "/admin/members", icon: "♙", label: "회원 관리" },
    { id: "revenue", path: "/admin/revenue", icon: "₩", label: "매출 통계" },
];

// 대시보드 테이블 UI를 위한 샘플 데이터입니다. 실제 DB 데이터가 아닙니다.
export const recentReservations = [
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

// 대시보드 UI를 위한 샘플 공연 데이터입니다. 실제 DB 데이터가 아닙니다.
export const concertExamples = [
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

export function formatNumber(value) {
    return Number(value ?? 0).toLocaleString("ko-KR");
}

export function formatCurrency(value) {
    return `₩${formatNumber(value)}`;
}
