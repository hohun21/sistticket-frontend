import {Routes, Route} from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPlaceholderPage from "./admin/AdminPlaceholderPage";
import AdminMembers from "./admin/AdminMembers.jsx";
import Login from "./member/Login.jsx";
import Signup from "./member/Signup.jsx";
import AdminRoute from "./admin/AdminRoute.jsx";
import FindId from "./member/FindId.jsx";
import FindPassword from "./member/FindPassword.jsx";

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
                <Route path={"signup"} element={<Signup />}/>
                {/*ID/PW 찾기*/}
                <Route path={"find-id"} element={<FindId />}/>
                <Route path={"find-password"} element={<FindPassword />}/>
            </Route>
        </Routes>
    );
}

export default App;
