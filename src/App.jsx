import { Routes, Route } from 'react-router-dom';

// 마이페이지 관련 컴포넌트
import MyPage from './pages/MyPage/MyPage';
import MyReviews from './pages/MyPage/MyReviews';
import Verify from './pages/MyPage/Verify';
import Edit from './pages/MyPage/Edit';
import Withdraw from './pages/MyPage/Withdraw';

// 관리자 및 회원(로그인) 관련 컴포넌트
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPlaceholderPage from "./admin/AdminPlaceholderPage";
import AdminMembers from "./admin/AdminMembers.jsx";
import Login from "./member/Login.jsx";
import AdminRoute from "./admin/AdminRoute.jsx";

function App() {
  return (
    <Routes>
      {/* 마이페이지 라우트 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/myreviews" element={<MyReviews />} /> 
      <Route path="/mypage/verify" element={<Verify />} />
      <Route path="/mypage/edit" element={<Edit />} />
      <Route path="/mypage/withdraw" element={<Withdraw />} />

      {/* 관리자 페이지 라우트 */}
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

      {/* 회원가입 및 로그인 라우트 */}
      <Route path="/member">
        <Route path="login" element={<Login/>}/>
        {/*<Route path="signup" element={<Signup />}/>*/}
      </Route>
    </Routes>
  );
}

export default App;