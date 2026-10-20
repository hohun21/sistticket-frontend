import { NavLink } from "react-router-dom";
import { adminMenuItems } from "./adminData";
import "./AdminSidebar.css"

function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <div className="admin-brand-symbol">S</div>
                <div>
                    <h1>SISTICKET</h1>
                    <span>ADMIN CONSOLE</span>
                </div>
            </div>

            <div className="admin-menu-heading">WORKSPACE</div>

            <nav className="admin-nav">
                {adminMenuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        end={item.id === "dashboard"}
                        className={({ isActive }) =>
                            `admin-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className="admin-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                                {isActive && <span className="admin-nav-indicator" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
            <a
                href="http://localhost/"
                className="admin-localhost-button"
            >
                <span>↗</span>
                메인 사이트로 이동
            </a>
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
