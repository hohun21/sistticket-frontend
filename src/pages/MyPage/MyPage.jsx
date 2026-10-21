import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  
  const [tickets, setTickets] = useState([
    {
      orderDetailId: 999,
      concertName: '[테스트용] S3 업로드 테스트 티켓',
      orderId: 'ORDER-TEST-999',
      bookingDate: '2026-10-19 15:00',
      status: '결제완료',
      price: 0,
      isReviewed: false 
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/mypage/user-info', {
          method: 'GET',
          credentials: 'include',
        });
        const contentType = userResponse.headers.get("content-type");

        if (!userResponse.ok || (contentType && !contentType.includes("application/json"))) {
          alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
          navigate('/member/login');
          return;
        }

        const userData = await userResponse.json();
        setUserName(userData.name);

        // 2. 티켓 예매 내역 호출 (더미 데이터 확인을 위해 연동 부분 주석 처리)
        /*
        const ticketResponse = await fetch('/api/mypage/tickets', {
          method: 'GET',
          credentials: 'include',
        });

        if (ticketResponse.ok) {
          const ticketData = await ticketResponse.json();
          if (ticketData.success) {
            setTickets(ticketData.tickets);
          }
        }
        */
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('세션이 만료되었거나 서버 통신에 실패했습니다.');
        navigate('/member/login');
      }
    };

    fetchData();
  }, [navigate]);

  const openReviewModal = (orderDetailId) => {
    setSelectedOrderId(orderDetailId);
    setRating(5);
    setReviewText('');
    setReviewImage(null);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
  };

  const submitReview = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('orderDetailId', selectedOrderId);
    formData.append('rating', rating);
    formData.append('text', reviewText);
    
    if (reviewImage) {
      formData.append('imageFile', reviewImage);
    }

    try {
      const response = await fetch('/api/mypage/review', {
        method: 'POST',
        credentials: 'include', 
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        alert('로그인이 풀렸습니다. 다시 로그인해 주세요.');
        navigate('/member/login');
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || '리뷰가 성공적으로 등록되었습니다!');
        
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.orderDetailId === selectedOrderId
              ? { ...ticket, isReviewed: true } 
              : ticket
          )
        );
        closeReviewModal();
      } else {
        alert(result.message || '리뷰 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mypage-body">
      <header className="mypage-header">
        <a href="http://localhost:80/" className="header-logo">SistTicket</a>
        <a href="http://localhost:80/" className="header-home-btn">메인으로 돌아가기</a>
      </header>

      <div className="mypage-wrapper">
        <aside className="sidebar">
          <h2>마이페이지</h2>
          <ul className="sidebar-menu">
            <li><Link to="/mypage" className="active">나의 예매 내역</Link></li>
            <li><Link to="/mypage/myreviews">내가 쓴 리뷰</Link></li>
            <li><Link to="/mypage/verify?target=edit">회원 정보 수정</Link></li>
            <li><Link to="/mypage/verify?target=withdraw" className="danger">회원 탈퇴</Link></li>
          </ul>
        </aside>

        <main className="mypage-content">
          <h1><span>{userName || '테스트유저'}</span>님의 예매 내역</h1>
          <p className="subtitle">내가 예매한 티켓 내역을 확인하고 리뷰를 작성할 수 있습니다.</p>

          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div className="ticket-card" key={ticket.orderDetailId}>
                <div className="ticket-info">
                  <h3 style={{ color: '#ff6b6b' }}>{ticket.concertName}</h3>
                  <p>주문 번호: <span>{ticket.orderId}</span></p>
                  <p>예매 일시: <span>{ticket.bookingDate}</span></p>
                  <p>상태: <span>{ticket.status}</span></p>
                </div>
                <div className="ticket-action">
                  <div className="price">{ticket.price === 0 ? '0원' : `${ticket.price.toLocaleString()}원`}</div>
                  
                  {ticket.isReviewed ? (
                    <button 
                      className="review-btn" 
                      style={{ backgroundColor: '#ccc', cursor: 'not-allowed' }} 
                      disabled
                    >
                      리뷰 작성 완료
                    </button>
                  ) : (
                    <button 
                      className="review-btn" 
                      onClick={() => openReviewModal(ticket.orderDetailId)}
                    >
                      리뷰 쓰기
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>예매한 내역이 없습니다.</p>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>공연 리뷰 작성</h2>
            <form onSubmit={submitReview}>
              
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((score) => (
                  <span
                    key={score}
                    className={`star ${score <= rating ? 'active' : ''}`}
                    onClick={() => setRating(score)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                placeholder="공연은 어떠셨나요? 솔직한 후기를 남겨주세요."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />

              <div className="file-upload-box">
                <label>관람 인증 사진 첨부</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewImage(e.target.files[0])}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="modal-btn btn-cancel" onClick={closeReviewModal}>
                  취소
                </button>
                <button type="submit" className="modal-btn btn-submit">
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;