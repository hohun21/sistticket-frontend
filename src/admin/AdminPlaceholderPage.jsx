import { Link } from "react-router-dom";
import { adminMenuItems } from "./adminData";

function AdminPlaceholderPage({ menuId }) {
    const currentMenu = adminMenuItems.find((item) => item.id === menuId);

    if (!currentMenu) {
        return <section className="admin-placeholder"><h2>페이지를 찾을 수 없습니다.</h2></section>;
    }

    return (
        <section className="admin-placeholder">
            <div className="placeholder-icon">{currentMenu.icon}</div>
            <span className="admin-eyebrow">SISTICKET MANAGEMENT</span>
            <h2>{currentMenu.label}</h2>
            <p>
                이 메뉴의 기능은 아직 구현되지 않았습니다.
                다음 단계에서 이 경로에 실제 관리 기능을 연결할 수 있습니다.
            </p>
            <Link to="/admin" className="back-dashboard-button">
                대시보드로 돌아가기
            </Link>
        </section>
    );
}

export default AdminPlaceholderPage;
