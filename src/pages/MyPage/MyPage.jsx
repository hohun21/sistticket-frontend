import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [tickets, setTickets] = useState([]);
  
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/mypage/user-info', {
          method: 'GET', credentials: 'include',
        });
        const contentType = userResponse.headers.get("content-type");

        if (!userResponse.ok || (contentType && !contentType.includes("application/json"))) {
          alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
          navigate('/member/login');
          return;
        }

        const userData = await userResponse.json();
        setUserName(userData.name);
        
        const ticketResponse = await fetch('/api/mypage/tickets', {
          method: 'GET', credentials: 'include',
        });

        if (ticketResponse.ok) {
          const ticketData = await ticketResponse.json();
          setTickets(Array.isArray(ticketData) ? ticketData : ticketData.tickets || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('세션이 만료되었거나 서버 통신에 실패했습니다.');
        navigate('/member/login');
      }
    };

    fetchData();
  }, [navigate]);

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'CONFIRMED') return ticket.status === 'CONFIRMED';
    if (filterStatus === 'CANCELLED') return ticket.status === 'CANCELLED';
    return true;
  });

  const groupedOrders = filteredTickets.reduce((acc, ticket) => {
    if (!acc[ticket.orderNo]) {
      acc[ticket.orderNo] = {
        orderNo: ticket.orderNo,
        performanceTitle: ticket.performanceTitle,
        performanceSeq: ticket.performanceSeq,
        startDate: ticket.startDate,
        createdAt: ticket.createdAt,
        venueName: ticket.venueName,
        totalPrice: 0,
        details: []
      };
    }
    acc[ticket.orderNo].details.push(ticket);
    acc[ticket.orderNo].totalPrice += ticket.price;
    return acc;
  }, {});

  const ordersArray = Object.values(groupedOrders);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = ordersArray.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ordersArray.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = async (orderDetailId) => {
    if (!window.confirm("정말 이 좌석의 예매를 취소하시겠습니까?")) return;
    try {
      const response = await fetch(`/api/mypage/tickets/cancel/${orderDetailId}`, { 
        method: 'POST', credentials: 'include'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || '예매가 성공적으로 취소되었습니다.');
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.orderDetailId === orderDetailId
              ? { ...ticket, buttonStatus: 'CANCELED', status: 'CANCELLED' } 
              : ticket
          )
        );
        setIsDetailModalOpen(false);
      } else {
        alert(result.message || '취소 처리에 실패했습니다.');
      }
    } catch (error) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const openDetailModal = (ticket) => {
    setSelectedDetail(ticket);
    setIsDetailModalOpen(true);
  };

  const openReviewModal = (orderDetailId) => {
    setSelectedOrderId(orderDetailId);
    setRating(5); setReviewText(''); setReviewImage(null);
    setIsReviewModalOpen(true);
  };

  const submitReview = async (event) => { 
    event.preventDefault();
    const formData = new FormData();
    formData.append('orderDetailId', selectedOrderId);
    formData.append('rating', rating);
    formData.append('text', reviewText);
    if (reviewImage) formData.append('imageFile', reviewImage);

    try {
      const response = await fetch('/api/mypage/review', {
        method: 'POST', credentials: 'include', body: formData,
      });
      if (response.status === 401 || response.status === 403) {
        alert('로그인이 풀렸습니다.'); navigate('/member/login'); return;
      }
      const result = await response.json();
      if (response.ok && result.success) {
        alert(result.message || '리뷰가 성공적으로 등록되었습니다!');
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.orderDetailId === selectedOrderId ? { ...ticket, buttonStatus: 'REVIEWED' } : ticket
          )
        );
        setIsReviewModalOpen(false);
      } else {
        alert(result.message || '리뷰 등록에 실패했습니다.');
      }
    } catch (error) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', { 
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
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
          <h1><span>{userName || '회원'}</span>님의 예매 내역</h1>
          <p className="subtitle">내가 예매한 티켓 내역을 확인하고 리뷰를 작성할 수 있습니다.</p>

          {/* 💡 필터(탭) 버튼 영역 추가 */}
          <div className="filter-tabs">
            <button 
              className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('ALL'); setCurrentPage(1); }}
            >
              전체보기
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('CONFIRMED'); setCurrentPage(1); }}
            >
              예매 완료
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('CANCELLED'); setCurrentPage(1); }}
            >
              취소 내역
            </button>
          </div>

          {currentOrders.length > 0 ? (
            <>
              {currentOrders.map((order) => (
                <div className="order-group-card" key={order.orderNo}>
                  <div className="order-header">
                    <div>
                      <h3>
                        {order.performanceTitle}
                        <span style={{ fontSize: '15px', color: '#e8b86d', marginLeft: '8px', fontWeight: 'normal' }}>
                          [{order.performanceSeq}회차]
                        </span>
                      </h3>
                      <p className="order-meta">주문 번호: {order.orderNo} <span>|</span> 결제 일시: {formatDate(order.createdAt)}</p>
                      <p className="order-meta">공연 일시: {formatDate(order.startDate)} <span>|</span> 장소: {order.venueName}</p>
                    </div>
                    <div className="order-total-price">
                      총 결제금액<br/><strong>{order.totalPrice.toLocaleString()}원</strong>
                    </div>
                  </div>

                  <div className="order-details-list">
                    {order.details.map((ticket, index) => (
                      <div className="ticket-item" key={ticket.orderDetailId}>
                        <div className="ticket-seat-info">
                          <span className="seat-badge">좌석 {index + 1}</span>
                          <span className="seat-name">{ticket.seatInfo || '좌석 정보 없음'}</span>
                          <span className="seat-price">{ticket.price.toLocaleString()}원</span>
                          {ticket.buttonStatus === 'CANCELED' && <span className="status-badge cancel">취소됨</span>}
                        </div>
                        
                        <div className="ticket-buttons">
                          <button className="btn-detail" onClick={() => openDetailModal(ticket)}>상세 보기</button>
                          {ticket.buttonStatus === 'CANCELABLE' && (
                            <button className="btn-cancel-ticket" onClick={() => handleCancel(ticket.orderDetailId)}>예매 취소</button>
                          )}
                          {ticket.buttonStatus === 'NON_CANCELABLE' && (
                            <button className="btn-disabled" disabled>취소 불가</button>
                          )}
                          {ticket.buttonStatus === 'REVIEWABLE' && (
                            <button className="btn-review" onClick={() => openReviewModal(ticket.orderDetailId)}>리뷰 쓰기</button>
                          )}
                          {ticket.buttonStatus === 'REVIEWED' && (
                            <button className="btn-disabled" disabled>리뷰 완료</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="page-btn nav-btn"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`page-btn ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="page-btn nav-btn"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-data"><p>해당하는 예매 내역이 없습니다.</p></div>
          )}
        </main>
      </div>

      {isDetailModalOpen && selectedDetail && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <h2>티켓 상세 정보</h2>
            <div className="detail-info-box">
              <p><strong>공연명:</strong> {selectedDetail.performanceTitle} ({selectedDetail.performanceSeq}회차)</p>
              <p><strong>공연 장소:</strong> {selectedDetail.venueName}</p>
              <p><strong>공연 일시:</strong> {formatDate(selectedDetail.startDate)}</p>
              <hr />
              <p><strong>주문 번호:</strong> {selectedDetail.orderNo}</p>
              <p><strong>상세 번호:</strong> {selectedDetail.orderDetailId}</p>
              <p><strong>결제 일시:</strong> {formatDate(selectedDetail.createdAt)}</p>
              <hr />
              <p><strong>선택 좌석:</strong> <span style={{color:'#e8b86d'}}>{selectedDetail.seatInfo || '좌석 정보 없음'}</span></p>
              <p><strong>좌석 금액:</strong> {selectedDetail.price.toLocaleString()}원</p>
              <p><strong>현재 상태:</strong> {selectedDetail.status === 'CANCELLED' ? <span style={{color:'#ff4d4f'}}>취소 완료</span> : '예매 완료'}</p>
            </div>
            
            <div className="modal-buttons" style={{ marginTop: '20px' }}>
              <button type="button" className="modal-btn btn-cancel" onClick={() => setIsDetailModalOpen(false)}>닫기</button>
              {selectedDetail.buttonStatus === 'CANCELABLE' && (
                 <button type="button" className="modal-btn" style={{background: '#ff4d4f', color: '#fff'}} onClick={() => handleCancel(selectedDetail.orderDetailId)}>
                   예매 취소
                 </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
             <h2>공연 리뷰 작성</h2>
            <form onSubmit={submitReview}>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((score) => (
                  <span key={score} className={`star ${score <= rating ? 'active' : ''}`} onClick={() => setRating(score)}>★</span>
                ))}
              </div>
              <textarea placeholder="공연은 어떠셨나요?" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
              <div className="file-upload-box">
                <label>관람 인증 사진 첨부</label>
                <input type="file" accept="image/*" onChange={(e) => setReviewImage(e.target.files[0])} />
              </div>
              <div className="modal-buttons">
                <button type="button" className="modal-btn btn-cancel" onClick={() => setIsReviewModalOpen(false)}>취소</button>
                <button type="submit" className="modal-btn btn-submit">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;