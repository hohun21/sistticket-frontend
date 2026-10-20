import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "../AdminPage.css";
import "./AdminRouter.css";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <AdminHeader />
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
