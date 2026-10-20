import { useLocation } from "react-router-dom";
import { adminMenuItems } from "./adminData";

function AdminHeader() {
    const { pathname } = useLocation();

    const currentMenu =
        adminMenuItems.find((item) => item.path === pathname) ??
        adminMenuItems.find(
            (item) => item.id !== "dashboard" && pathname.startsWith(`${item.path}/`)
        ) ??
        adminMenuItems[0];

    return (
        <header className="admin-topbar">
            <div className="admin-breadcrumb">
                <span>관리자</span>
                <span className="breadcrumb-divider">/</span>
                <strong>{currentMenu.label}</strong>
            </div>

            <div className="admin-profile">
                <div className="admin-profile-status">
                    <span />
                    관리자 모드
                </div>
                <div className="admin-avatar">관</div>
                <div className="admin-profile-info">
                    <strong>관리자</strong>
                    <span>Administrator</span>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;
