
import { Routes, Route } from "react-router-dom";

// 메인페이지
import MainPage from "./mainpage/MainPage";

// 공연 관련 컴포넌트
import List_customer from "./concert/List_customer";
import Detail from "./concert/Detail";
import SeatBooking from "./seat/SeatBooking.jsx";

// 결제 관련 컴포넌트
import PaymentCheckout from "./payment/PaymentCheckout.jsx";
import PaymentResult from "./payment/PaymentResult.jsx";

// 마이페이지 관련 컴포넌트
import MyPage from "./pages/MyPage/MyPage";
import MyReviews from "./pages/MyPage/MyReviews";
import Verify from "./pages/MyPage/Verify";
import Edit from "./pages/MyPage/Edit";
import Withdraw from "./pages/MyPage/Withdraw";

// 관리자 관련 컴포넌트
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPlaceholderPage from "./admin/AdminPlaceholderPage";
import AdminMembers from "./admin/AdminMembers.jsx";
import AdminRoute from "./admin/AdminRoute.jsx";

// 회원 관련 컴포넌트
import Login from "./member/Login.jsx";
import Signup from "./member/Signup.jsx";
import FindId from "./member/FindId.jsx";
import FindPassword from "./member/FindPassword.jsx";

function App() {
  return (
    <Routes>
      {/* 메인페이지 */}
      <Route path="/" element={<MainPage />} />

      {/* 공연 */}
      <Route path="/concert/list" element={<List_customer />} />
      <Route path="/concert/:concertId" element={<Detail />} />

      {/* 좌석 및 예매 */}
      <Route path="/seat/select" element={<SeatBooking />} />

      {/* 결제 */}
      <Route path="/payment/checkout" element={<PaymentCheckout />} />
      <Route path="/payment/result" element={<PaymentResult />} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/myreviews" element={<MyReviews />} />
      <Route path="/mypage/verify" element={<Verify />} />
      <Route path="/mypage/edit" element={<Edit />} />
      <Route path="/mypage/withdraw" element={<Withdraw />} />

      {/* 관리자 */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route
            path="concerts"
            element={<AdminPlaceholderPage menuId="concerts" />}
          />
          <Route
            path="reservations"
            element={<AdminPlaceholderPage menuId="reservations" />}
          />
          <Route
            path="members"
            element={<AdminMembers menuId="members" />}
          />
          <Route
            path="revenue"
            element={<AdminPlaceholderPage menuId="revenue" />}
          />
        </Route>
      </Route>

      {/* 로그인 및 회원가입 */}
      <Route path="/member/login" element={<Login />} />
      <Route path="/member/signup" element={<Signup />} />
      <Route path="/member/find-id" element={<FindId />} />
      <Route path="/member/find-password" element={<FindPassword />} />
    </Routes>
  );
}

export default App;
