import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Edit.css';

function Edit() {
  const navigate = useNavigate();

  // 처음에는 빈칸으로 비워둡니다.
  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/mypage/user-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // 받아온 진짜 정보로 화면 업데이트
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
        } else {
          alert('로그인이 필요한 서비스입니다.');
          window.location.href = 'http://localhost:80/login';
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []); // 빈 배열을 넣어 처음에 딱 한 번만 실행되게 설정

  // 폼 제출 함수
  const submitEdit = async (event) => {
    event.preventDefault();

    const requestData = {
      phone: phone,
      password: password
    };

    try {
      const response = await fetch('/api/mypage/edit', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || '수정되었습니다.');
        navigate('/mypage'); // 성공 시 메인 마이페이지로 이동
      } else {
        alert(result.message || '정보 수정 중 오류가 발생했습니다.');
        if (response.status === 403) {
          // 세션 만료 등 권한 오류 시 다시 인증 페이지로
          navigate('/mypage/verify?target=edit');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="edit-page-wrapper">
      <div className="mypage-container">
        
        {/* 사이드바 */}
        <aside className="sidebar">
          <h2>마이페이지</h2>
          <ul>
            <li><Link to="/mypage">예매 내역</Link></li>
            <li><Link to="/mypage/verify?target=edit" className="active">회원 정보 수정</Link></li>
            <li><Link to="/mypage/verify?target=withdraw" className="danger">회원 탈퇴</Link></li>
          </ul>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="content">
          <h1>회원 정보 수정</h1>
          <p className="subtitle">안전한 서비스 이용을 위해 개인 정보를 최신 상태로 유지해 주세요.<br />이름과 이메일은 변경할 수 없습니다.</p>

          <form onSubmit={submitEdit}>
            
            <div className="form-group">
              <label>이메일 (아이디)</label>
              {/* React에서는 readOnly를 대문자 O로 적어야 합니다 */}
              <input type="text" value={email} readOnly />
            </div>
            
            <div className="form-group">
              <label>이름</label>
              <input type="text" value={name} readOnly />
            </div>
            
            <div className="form-group">
              <label>전화번호</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>새 비밀번호</label>
              <input 
                type="password" 
                placeholder="변경할 경우에만 입력해 주세요. (기존 비밀번호 유지 시 비워두세요)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button type="submit" className="submit-btn">수정 완료</button>
          </form>
        </main>

      </div>
    </div>
  );
}

export default Edit;