import {useEffect, useState} from "react";
import {Navigate, Outlet, useLocation} from "react-router-dom";

function AdminRoute(props) {
    const [authStatus, setAuthStatus] = useState("loading");
    const location = useLocation();

    useEffect(() => {
        let cancelled = false;

        async function checkAdmin() {
            try {
                const response = await fetch("/api/admin/check", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                });
                if (!cancelled) {
                    setAuthStatus(response.ok ? "allowed" : "denied");
                }
            } catch (e) {
                console.error("관리자 인증 확인 실패 : ", e);
                if(!cancelled) {
                    setAuthStatus("denied");
                }
            }
        }
        void checkAdmin();
        return () => {
            cancelled = true;
        }
    }, []);
    // 인증 확인 중에는 보호된 페이지를 보여주지 않음
    if(authStatus === "loading"){
        return <div>관리자 권한 확인중 ....</div>
    }
    // 로그인하지 않았거나 관리자 권한이 없으면 로그인 페이지로 이동
    if (authStatus !== "allowed") {
        return (
            <Navigate
                to="/member/login"
                replace
                state={{ from: location }}
            />
        );
    }
    return <Outlet />;
}

export default AdminRoute;