import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminMenuItems } from "./adminData";

function AdminHeader() {
    const { pathname } = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetch("/api/admin/me", {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`사용자 정보 조회 실패: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("로그인 사용자 정보:", data);
                setCurrentUser(data);
            })
            .catch((error) => {
                console.error("사용자 정보 조회 오류:", error);
            });
    }, []);

    const currentMenu =
        adminMenuItems.find((item) => item.path === pathname) ??
        adminMenuItems.find(
            (item) =>
                item.id !== "dashboard" &&
                pathname.startsWith(`${item.path}/`)
        ) ??
        adminMenuItems[0];

    const userName =
        currentUser?.name || currentUser?.email || "불러오는 중";

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

                <div className="admin-avatar">
                    {userName === "불러오는 중"
                        ? "관"
                        : userName.charAt(0)}
                </div>

                <div className="admin-profile-info">
                    <strong>{userName}</strong>
                    <span>
                        {currentUser?.Name || "Administrator"}
                    </span>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;