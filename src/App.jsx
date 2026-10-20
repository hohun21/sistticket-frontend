import { Routes, Route } from 'react-router-dom';

import MyPage from './pages/MyPage/MyPage';
import MyReviews from './pages/MyPage/MyReviews';
import Verify from './pages/MyPage/Verify';
import Edit from './pages/MyPage/Edit';
import Withdraw from './pages/MyPage/Withdraw';

function App() {
  return (
    <Routes>
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/myreviews" element={<MyReviews />} /> 
      <Route path="/mypage/verify" element={<Verify />} />
      <Route path="/mypage/edit" element={<Edit />} />
      <Route path="/mypage/withdraw" element={<Withdraw />} />
    </Routes>
  );
}

export default App;