import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MainPage.css';

function MainPage() {
    const [latestConcerts, setLatestConcerts] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchConcerts = async () => {
            try {
                const response = await axios.get('http://localhost/api/main/latest');
                setLatestConcerts(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchAuthStatus = async () => {
            try {
                const response = await axios.get('http://localhost/api/member/me', {
                    withCredentials: true 
                });
                setUser(response.data); 
            } catch (error) {
                setUser(null); 
            }
        };

        fetchConcerts();
        fetchAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost/logout', {}, {
                withCredentials: true
            });
            window.location.href = 'http://localhost:5173'; 
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="main-wrapper">
            <header>
                <h1 className="main">
                    <Link to="/" style={{ position: 'absolute', top: '30px' }}>SIST TICKET</Link>
                </h1>
                
                <ul>
                    {!user ? (
                        <>
                            <li><Link to="/member/login">로그인</Link></li>
                            <li><Link to="/member/signup">회원가입</Link></li>
                        </>
                    ) : (
                        <>
                            <li className="welcome-message">
                                <span>{user.name}</span>님 반갑습니다.
                            </li>
                            
                            {user.role === 'ROLE_ADMIN' ? (
                                <li><Link to="/admin">관리자 콘솔</Link></li>
                            ) : (
                                <li><Link to="/mypage">마이페이지</Link></li>
                            )}
                            
                            <li>
                                <button 
                                    onClick={handleLogout} 
                                    className="logout-button btn btn-primary"
                                    style={{ border: 'none' }}
                                >
                                    로그아웃
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <span className="hero-label">SIST TICKET</span>
                        <h2>당신의 다음 순간,<br />무대 위에서</h2>
                        <p>
                            기다려 온 공연을 만나고<br />
                            잊지 못할 순간을 예매하세요.
                        </p>
                        <a href="http://localhost/concert/list" className="btn btn-primary">
                            공연 둘러보기 →
                        </a>
                    </div>
                </section>

                <section className="section">
                    <h2 className="section-title">최신 인기 공연</h2>
                    <p className="section-description">
                        지금 주목받는 뮤지컬과 공연을 만나보세요.
                    </p>

                    <div className="concert-grid">
                        {latestConcerts.map((concert) => (
                            <article className="concert-card" key={concert.concertId}>
                                <div className="concert-poster">
                                    <img src={concert.posterUrl} alt="공연 포스터" />
                                </div>
                                <div className="concert-info">
                                    <span className="concert-category">{concert.category}</span>
                                    <h3 className="concert-title">{concert.title}</h3>
                                    <p className="concert-meta">{concert.venueName}</p>
                                    <p className="concert-meta">
                                        {concert.startDate.substring(0, 10)} ~ {concert.endDate.substring(0, 10)}
                                    </p>
                                    <a href={`http://localhost/concert/${concert.concertId}`} className="btn btn-primary">
                                        예매하기
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <footer>
                <p><strong>SistTicket</strong></p>
                <p>당신의 특별한 순간을 위한 티켓팅 서비스</p>
                <p>© 2026 SistTicket. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default MainPage;