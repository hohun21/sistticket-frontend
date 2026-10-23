import { useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { adminMenuItems } from "./adminData";
import "./AdminSidebar.css";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    // 사이드바 오른쪽 끝 전체를 드래그해서 너비 조절
    const handleResizePointerDown = (event) => {
        if (event.button !== 0) return;

        const sidebar = sidebarRef.current;
        if (!sidebar) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = sidebar.getBoundingClientRect().width;

        const previousCursor = document.body.style.cursor;
        const previousUserSelect = document.body.style.userSelect;

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const handlePointerMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = Math.min(
                380,
                Math.max(76, startWidth + deltaX)
            );

            sidebar.style.width = `${newWidth}px`;
            sidebar.style.flex = `0 0 ${newWidth}px`;
        };

        const cleanup = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", cleanup);
            window.removeEventListener("pointercancel", cleanup);

            document.body.style.cursor = previousCursor;
            document.body.style.userSelect = previousUserSelect;
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", cleanup);
        window.addEventListener("pointercancel", cleanup);
    };

    return (
        <aside className="admin-sidebar" ref={sidebarRef}>
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

                    const isExpanded =
                        location.pathname === item.path;

                    const isParentActive =
                        location.pathname === item.path;

                    return (
                        <div
                            className="admin-nav-group"
                            key={item.id}
                        >
                            {hasChildren ? (
                                <>
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
                href="/"
                className="admin-localhost-button"
                title="메인 사이트로 이동"
                aria-label="메인 사이트로 이동"
            >
                <span className="admin-localhost-icon">↗</span>
                <span className="admin-localhost-text">
                    메인 사이트로 이동
                </span>
            </a>

            {/* 하단 관리자 정보 */}
            <div className="admin-sidebar-bottom">
                <div className="admin-help-icon">?</div>

                <div>
                    <strong>관리자 센터</strong>
                    <p>SistTicket Management</p>
                </div>
            </div>

            {/* 사이드바 오른쪽 전체 높이의 크기 조절 핸들 */}
            <div
                className="admin-sidebar-resizer"
                onPointerDown={handleResizePointerDown}
                role="separator"
                aria-orientation="vertical"
                aria-label="사이드바 너비 조절"
            />
        </aside>
    );
}

export default AdminSidebar;