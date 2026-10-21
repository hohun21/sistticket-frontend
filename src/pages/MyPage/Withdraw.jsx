import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Withdraw.css';

function Withdraw() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/mypage/user-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          alert('로그인이 필요한 서비스입니다.');
          window.location.href = 'http://localhost:80/login';
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  const submitWithdraw = async (event) => {
    event.preventDefault();

    if (!window.confirm('정말로 탈퇴하시겠습니까? 탈퇴 후에는 취소할 수 없습니다.')) {
      return; 
    }

    try {
      const response = await fetch('/api/mypage/withdraw', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password }) 
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || '탈퇴 처리가 완료되었습니다.');
        window.location.href = 'http://localhost:80/?message=withdraw_success';
      } else {
        alert(result.message || '탈퇴 처리 중 오류가 발생했습니다.');
        
        if (response.status === 403) {
          navigate('/mypage/verify?target=withdraw');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="withdraw-page-wrapper">
      <div className="mypage-container">
        
        {/* 사이드바 */}
        <aside className="sidebar">
          <h2>마이페이지</h2>
          <ul>
            <li><Link to="/mypage">예매 내역</Link></li>
            <li><Link to="/mypage/verify?target=edit">회원 정보 수정</Link></li>
            <li><Link to="/mypage/verify?target=withdraw" className="danger active">회원 탈퇴</Link></li>
          </ul>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="content">
          <h1>회원 탈퇴</h1>
          
          <div className="warning-box">
            <h3>유의사항</h3>
            <ul>
              <li>탈퇴 시 모든 기기에서 즉시 로그아웃되며, 계정 복구가 불가능합니다.</li>
              <li>기존에 예매하신 티켓 내역 및 작성하신 리뷰는 서비스 운영을 위해 보관됩니다.</li>
              <li>진행 중인 예매 내역이 있을 경우 환불 처리에 불이익이 있을 수 있습니다.</li>
            </ul>
          </div>

          <form onSubmit={submitWithdraw}>
            <div className="form-group">
              <label>본인 확인을 위해 비밀번호를 한 번 더 입력해 주세요.</label>
              <input 
                type="password" 
                placeholder="비밀번호 입력" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                autoFocus 
              />
            </div>
            
            <button type="submit" className="withdraw-btn">안내사항을 확인하였으며, 탈퇴에 동의합니다.</button>
          </form>
        </main>

      </div>
    </div>
  );
}

export default Withdraw;