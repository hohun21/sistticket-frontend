
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { adminMenuItems } from "./adminData";
import "./AdminSidebar.css";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="admin-sidebar">
            {/* 로고 */}
            <div className="admin-brand">
                <div className="admin-brand-symbol">S</div>
                <div>
                    <h1>SISTICKET</h1>
                    <span>ADMIN CONSOLE</span>
                </div>
            </div>

            <div className="admin-menu-heading">WORKSPACE</div>

            {/* 메뉴 */}
            <nav className="admin-nav">
                {adminMenuItems.map((item) => {
                    const hasChildren = item.children?.length > 0;

                    // 예매 관리 페이지를 볼 때만 하위 메뉴 펼치기
                    const isExpanded = location.pathname === item.path;

                    const isParentActive = location.pathname === item.path;

                    return (
                        <div
                            className="admin-nav-group"
                            key={item.id}
                        >
                            {hasChildren ? (
                                <>
                                    {/* 예매 관리 */}
                                    <button
                                        type="button"
                                        className={`admin-nav-item admin-nav-parent ${
                                            isParentActive ? "active" : ""
                                        }`}
                                        onClick={() => navigate(item.path)}
                                        aria-expanded={isExpanded}
                                    >
                                        <span className="admin-nav-icon">
                                            {item.icon}
                                        </span>

                                        <span className="admin-nav-label">
                                            {item.label}
                                        </span>

                                        <span
                                            className={`admin-submenu-arrow ${
                                                isExpanded ? "expanded" : ""
                                            }`}
                                        >
                                            ▾
                                        </span>
                                    </button>

                                    {/* 현재 예매 관리 페이지에서만 표시 */}
                                    {isExpanded && (
                                        <div className="admin-subnav">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.id}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `admin-subnav-item ${
                                                            isActive ? "active" : ""
                                                        }`
                                                    }
                                                >
                                                    <span className="admin-subnav-icon">
                                                        {child.icon ?? "↳"}
                                                    </span>

                                                    <span>{child.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : item.path.startsWith("http") ? (
                                /* 외부 페이지 */
                                <a
                                    href={item.path}
                                    className="admin-nav-item"
                                >
                                    <span className="admin-nav-icon">
                                        {item.icon}
                                    </span>

                                    <span>{item.label}</span>
                                </a>
                            ) : (
                                /* 일반 메뉴 */
                                <NavLink
                                    to={item.path}
                                    end={item.id === "dashboard"}
                                    className={({ isActive }) =>
                                        `admin-nav-item ${
                                            isActive ? "active" : ""
                                        }`
                                    }
                                >
                                    <span className="admin-nav-icon">
                                        {item.icon}
                                    </span>

                                    <span>{item.label}</span>
                                </NavLink>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* 메인 사이트 이동 */}
            <a
                href="http://localhost:5173/"
                className="admin-localhost-button"
            >
                <span>↗</span>
                메인 사이트로 이동
            </a>

            {/* 하단 관리자 정보 */}
            <div className="admin-sidebar-bottom">
                <div className="admin-help-icon">?</div>

                <div>
                    <strong>관리자 센터</strong>
                    <p>SistTicket Management</p>
                </div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
