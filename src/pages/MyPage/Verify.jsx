import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Verify.css';

function Verify() {
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const target = searchParams.get('target'); 
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/mypage/user-info', {
          method: 'GET',
          credentials: 'include',
        });

        const contentType = response.headers.get("content-type");

        if (!response.ok || (contentType && !contentType.includes("application/json"))) {
          alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
          navigate('/member/login');
          return;
        }

      } catch (error) {
        console.error('Error checking session:', error);
        alert('세션이 만료되었거나 서버 통신에 실패했습니다.');
        navigate('/member/login');
      }
    };

    checkSession();
  }, [navigate]);

  const submitVerify = async (event) => {
    event.preventDefault();
    setErrorMsg('');

    try {
      // Spring Boot의 API 컨트롤러로 JSON 전송
      const response = await fetch('/api/mypage/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        navigate(`/mypage/${target}`);
      } else {
        setErrorMsg(result.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="verify-page-wrapper">
      <div className="verify-container">
        <h2>비밀번호 확인</h2>
        <p>안전한 개인정보 보호를 위해<br />비밀번호를 다시 한번 입력해 주세요.</p>
        
        <form onSubmit={submitVerify}>
          <div className="input-group">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            {errorMsg && <div className="error-message">{errorMsg}</div>}
          </div>
          
          <button type="submit" className="submit-btn">확인</button>
        </form>
        
        <Link to="/mypage" className="back-link">마이페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

export default Verify;