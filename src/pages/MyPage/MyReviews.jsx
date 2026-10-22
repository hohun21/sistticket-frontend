import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyReviews.css';

function MyReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 수정 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [existingImgUrl, setExistingImgUrl] = useState(''); 
  const [newImageFile, setNewImageFile] = useState(null);   
  const [deleteImage, setDeleteImage] = useState(false);

  useEffect(() => {
    const fetchMyReviews = async () => {
        try {
            const response = await fetch(`/api/mypage/myreviews?page=${currentPage}&size=3`, {
            method: 'GET',
            credentials: 'include',
            });

            const contentType = response.headers.get("content-type");

            if (!response.ok || (contentType && !contentType.includes("application/json"))) {
                alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
                navigate('/member/login');
                return;
            }

            const data = await response.json();
            if(data.success){
                setReviews(data.reviews);
                setTotalPages(data.totalPages);
            }
        } catch (error){
            console.error('Error fetching reviews:', error);
            alert('세션이 만료되었거나 서버 통신에 실패했습니다.');
            navigate('/member/login');
        } finally {
            setLoading(false);
        }
    };

    fetchMyReviews();
  }, [currentPage, navigate]);

  const handleDelete = async (reviewId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('리뷰가 성공적으로 삭제되었습니다.');
          setReviews(reviews.filter((review) => review.reviewId !== reviewId));
        } else {
          alert(result.message || '리뷰 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('서버와 통신 중 오류가 발생했습니다.');
      }
    }
  };

  const openEditModal = (review) => {
    setSelectedReviewId(review.reviewId);
    setRating(review.rating);
    setReviewText(review.text);
    setExistingImgUrl(review.imgUrl || '');
    setNewImageFile(null);
    setDeleteImage(false);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedReviewId(null);
    setNewImageFile(null);
    setDeleteImage(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('text', reviewText);
    formData.append('deleteImage', deleteImage);
    
    if (newImageFile) {
      formData.append('imageFile', newImageFile);
    }

    try {
      const response = await fetch(`/api/reviews/${selectedReviewId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('리뷰가 성공적으로 수정되었습니다.');
        
        setReviews(reviews.map((review) => 
          review.reviewId === selectedReviewId 
            ? { ...review, rating: rating, text: reviewText, imgUrl: result.imgUrl } 
            : review
        ));
        
        closeEditModal();
      } else {
        alert(result.message || '리뷰 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    if(!dateString) return '';
    return dateString.substring(0, 10);
  };

 return (
    <div className="mypage-body">
      <header className="mypage-header">
        <Link to="/" className="header-logo">SistTicket</Link>
        <Link to="/" className="header-home-btn">메인으로 돌아가기</Link>
      </header>

      <div className="mypage-wrapper">
        <aside className="sidebar">
          <h2>마이페이지</h2>
          <ul className="sidebar-menu">
            <li><Link to="/mypage">나의 예매 내역</Link></li>
            <li><Link to="/mypage/myreviews" className="active">내가 쓴 리뷰</Link></li>
            <li><Link to="/mypage/verify?target=edit">회원 정보 수정</Link></li>
            <li><Link to="/mypage/verify?target=withdraw" className="danger">회원 탈퇴</Link></li>
          </ul>
        </aside>

        <main className="mypage-content">
          <h1>내가 쓴 리뷰</h1>
          <p className="subtitle">관람하신 공연에 대해 남겨주신 소중한 후기입니다.</p>

          {loading ? (
            <p>리뷰를 불러오는 중입니다...</p>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <p>아직 작성하신 리뷰가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="review-list">
                {reviews.map((review) => (
                  <div key={review.reviewId} className="review-card">
                    
                    <div className="ticket-info" style={{ flex: 1 }}>
                      <div className="review-card-header">
                        <h3>{review.concertTitle}</h3>
                        <div className="card-action-btns">
                          <button className="action-btn edit-btn" onClick={() => openEditModal(review)}>
                            수정
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(review.reviewId)}>
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="review-meta-box">
                        <p className="review-rating">{renderStars(review.rating)}</p>
                        <p className="review-date">작성일: {formatDate(review.createdAt)}</p>
                      </div>

                      <p className="review-text">{review.text}</p>
                    </div>

                    {review.imgUrl && (
                      <div className="review-image-container">
                        <img src={review.imgUrl} alt="관람 인증 사진" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 0 && (
                <div className="pagination">
                  <button 
                    className="page-btn" 
                    disabled={currentPage === 0} 
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    이전
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={`page-btn ${currentPage === index ? 'active' : ''}`}
                      onClick={() => setCurrentPage(index)}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button 
                    className="page-btn" 
                    disabled={currentPage === totalPages - 1} 
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 리뷰 수정 모달 창 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>공연 리뷰 수정</h2>
            <form onSubmit={handleUpdateSubmit}>
              
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

              <div className="file-upload-box" style={{ marginTop: '15px' }}>
                <label>관람 인증 사진 수정</label>
                
                {existingImgUrl && !deleteImage && !newImageFile && (
                  <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={existingImgUrl} alt="기존 인증샷" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3a3d4f' }} />
                    <button 
                      type="button" 
                      onClick={() => setDeleteImage(true)}
                      style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      이미지 삭제
                    </button>
                  </div>
                )}

                {deleteImage && (
                  <div style={{ margin: '8px 0', fontSize: '13px', color: '#ef4444' }}>
                    <span>이미지가 삭제되었습니다. (새 이미지를 업로드하거나 그대로 저장할 수 있습니다)</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setNewImageFile(e.target.files[0]);
                    setDeleteImage(false);
                  }}
                  style={{ marginTop: '5px', color: '#ccc' }}
                />
              </div>

              <div className="modal-buttons" style={{ marginTop: '20px' }}>
                <button type="button" className="modal-btn btn-cancel" onClick={closeEditModal}>
                  취소
                </button>
                <button type="submit" className="modal-btn btn-submit">
                  수정하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReviews;