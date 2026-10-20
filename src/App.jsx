import {Routes, Route} from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPlaceholderPage from "./admin/AdminPlaceholderPage";
import AdminMembers from "./admin/AdminMembers.jsx";
import Login from "./member/Login.jsx";
import AdminRoute from "./admin/AdminRoute.jsx";

function App() {
    return (
        <Routes>
            {/*관리자 페이지*/}
            <Route element={<AdminRoute/>}>
                <Route path="/admin" element={<AdminLayout/>}>
                    <Route index element={<AdminDashboard/>}/>
                    <Route
                        path="concerts"
                        element={<AdminPlaceholderPage menuId="concerts"/>}
                    />
                    <Route
                        path="reservations"
                        element={<AdminPlaceholderPage menuId="reservations"/>}
                    />
                    <Route
                        path="members"
                        element={<AdminMembers menuId="members"/>}
                    />
                    <Route
                        path="revenue"
                        element={<AdminPlaceholderPage menuId="revenue"/>}
                    />
                </Route>
            </Route>
            {/* 회원가입 로그인 */}
            <Route path={"/member"}>
                <Route path={"login"} element={<Login/>}/>
                {/*<Route pahth={"signup"} element={<Signup />}/>*/}
            </Route>
        </Routes>
    );
}

export default App;
