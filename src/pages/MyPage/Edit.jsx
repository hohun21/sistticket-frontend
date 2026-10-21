import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Edit.css';

function Edit() {
  const navigate = useNavigate();

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
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
        } else {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/member/login');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

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
        if (password !== '') {
          alert('비밀번호가 변경되었습니다. 안전을 위해 다시 로그인해 주세요.');
          navigate('/member/login'); 
        } else {
          alert(result.message || '수정되었습니다.');
          navigate('/mypage'); 
        }
      } else {
        alert(result.message || '정보 수정 중 오류가 발생했습니다.');
        if (response.status === 403) {
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
        
        <aside className="sidebar">
          <h2>마이페이지</h2>
          <ul>
            <li><Link to="/mypage">예매 내역</Link></li>
            <li><Link to="/mypage/verify?target=edit" className="active">회원 정보 수정</Link></li>
            <li><Link to="/mypage/verify?target=withdraw" className="danger">회원 탈퇴</Link></li>
          </ul>
        </aside>

        <main className="content">
          <h1>회원 정보 수정</h1>
          <p className="subtitle">안전한 서비스 이용을 위해 개인 정보를 최신 상태로 유지해 주세요.<br />이름과 이메일은 변경할 수 없습니다.</p>

          <form onSubmit={submitEdit}>
            
            <div className="form-group">
              <label>이메일 (아이디)</label>
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