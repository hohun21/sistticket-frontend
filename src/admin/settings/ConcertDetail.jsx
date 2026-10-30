import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConcertDetail.css';

export default function ConcertDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchConcertDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axios.get(`/api/concert/${id}`, { withCredentials: true });
            setConcert(res.data);
        } catch (err) {
            console.error('콘서트 상세 정보 조회 실패:', err);
            setError('콘서트 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchConcertDetail();
        }
    }, [id]);

    const handleDeleteConcert = async () => {
        if (!window.confirm("정말 이 콘서트를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/api/concert/${id}`, { withCredentials: true });
            alert("성공적으로 삭제되었습니다.");
            navigate('/admin/settings/concert');
        } catch (err) {
            console.error('콘서트 삭제 실패:', err);
            alert("삭제 처리에 실패했습니다.");
        }
    };

    const handleDeletePerformance = async (performanceId) => {
        if (!window.confirm("정말 이 회차를 삭제하시겠습니까? 연관된 캐스팅 정보도 함께 삭제됩니다.")) return;
        try {
            await axios.delete(`/api/concert/${id}/performance/${performanceId}`, { withCredentials: true });
            alert("회차가 성공적으로 삭제되었습니다.");
            fetchConcertDetail();
        } catch (err) {
            console.error('회차 삭제 실패:', err);
            alert("회차 삭제에 실패했습니다.");
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '-';
        const str = dateTimeStr.toString().replace('T', ' ');
        return str.includes('.') ? str.split('.')[0] : str;
    };

    if (loading) {
        return <div className="concert-detail-container text-center py-5">공연 상세 정보를 불러오는 중입니다...</div>;
    }

    if (error || !concert) {
        return (
            <div className="concert-detail-container text-center py-5">
                <h2>공연 정보 오류</h2>
                <p className="text-muted">{error || '존재하지 않는 공연입니다.'}</p>
                <button type="button" className="concert-detail-back-link mt-3" onClick={() => navigate('/admin/settings/concert')}>
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    const posterUrl = concert.imgUrl || concert.posterUrl;

    return (
        <div className="concert-detail-container">
            
            {/* 상단 컨트롤 바 (완벽한 일렬 정렬) */}
            <div className="concert-detail-top-bar">
                <button type="button" className="concert-detail-back-link" onClick={() => navigate('/admin/settings/concert')}>
                    <i className="fa-solid fa-arrow-left me-1.5"></i> 목록 보기
                </button>
                
                <div className="concert-detail-top-btns">
                    <button type="button" className="concert-detail-sub-btn" onClick={() => navigate(`/admin/settings/concert/${id}/roles`)}>
                        배역 관리
                    </button>
                    <button type="button" className="concert-detail-main-btn" onClick={() => navigate(`/admin/settings/concert/${id}/performance/new`)}>
                        회차 생성
                    </button>
                    <button type="button" className="concert-detail-sub-btn" onClick={() => navigate(`/admin/settings/concert/edit/${id}`)}>
                        ✏️ 수정
                    </button>
                    <button type="button" className="concert-detail-danger-btn" onClick={handleDeleteConcert}>
                        삭제
                    </button>
                </div>
            </div>

            {/* 공연 기본 정보 카드 */}
            <div className="concert-detail-card">
                <div className="concert-info-flex">
                    <div className="concert-poster-wrapper">
                        {posterUrl ? (
                            <img src={posterUrl} alt="공연 포스터" className="concert-poster-img" />
                        ) : (
                            <div className="no-image-placeholder">
                                <i className="fa-regular fa-image fa-2x mb-2"></i>
                                <span>이미지 준비중</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="concert-info-content">
                        <div>
                            <span className="concert-genre-badge">
                                {concert.genreName || '장르미정'}
                            </span>
                            <h2 className="concert-title">
                                {concert.concertName || concert.title}
                            </h2>
                            
                            <ul className="concert-specs-list">
                                <li>
                                    <span className="spec-label">장소</span> 
                                    <span className="spec-value text-dark fw-semibold">{concert.venueName || '공연장 미정'}</span> 
                                    {concert.venueAddress && <span className="text-secondary small">({concert.venueAddress})</span>}
                                </li>
                                <li>
                                    <span className="spec-label">러닝타임</span> 
                                    <span className="spec-value">{concert.runTimeMinutes || concert.runningTime ? `${concert.runTimeMinutes || concert.runningTime}분` : '정보 없음'}</span>
                                </li>
                                <li>
                                    <span className="spec-label">공연 기간</span> 
                                    <span className="spec-value">{formatDateTime(concert.startDate)} ~ {formatDateTime(concert.endDate)}</span>
                                </li>
                                <li>
                                    <span className="spec-label">상태</span> 
                                    <span className="spec-value text-success fw-bold">{concert.status || 'UPCOMING'}</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <a href="#performanceSection" className="concert-detail-reserve-btn" style={{ textDecoration: 'none' }}>
                                예매하기 / 회차 선택
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* 회차 및 캐스팅 일정 목록 */}
            <div id="performanceSection" className="concert-detail-card">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: '#e8ebf2' }}>
                    <h4 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#202938' }}>
                        🎟️ 회차 및 캐스팅 일정 목록
                    </h4>
                    <span className="text-muted small">총 {concert.performanceList ? concert.performanceList.length : 0}개 회차</span>
                </div>

                {concert.performanceList && concert.performanceList.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                        {concert.performanceList.map((perf, index) => (
                            <div className="performance-item-card" key={perf.performanceId || index}>
                                <div className="perf-card-header">
                                    <div className="perf-info-group">
                                        <span className="performance-badge-num">회차 {index + 1}</span>
                                        <div>
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <span className="perf-date-text">
                                                    {formatDateTime(perf.performanceDate)}
                                                </span>
                                                <span className="perf-status-badge">
                                                    {perf.status || 'AVAILABLE'}
                                                </span>
                                            </div>
                                            <span className="perf-sub-text">
                                                예매 기간: {formatDateTime(perf.bookingStart)} ~ {formatDateTime(perf.bookingEnd)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="perf-action-group">
                                        <button 
                                            type="button" 
                                            className="btn-action-edit"
                                            onClick={() => navigate(`/admin/settings/concert/${id}/performance/${perf.performanceId}/edit`)}
                                        >
                                            ✏️ 수정
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn-action-delete"
                                            onClick={() => handleDeletePerformance(perf.performanceId)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                <div className="performance-divider"></div>

                                <div>
                                    <div className="fw-bold text-secondary small mb-2">출연진 캐스팅</div>
                                    {/* 4개씩 가로 정렬되는 테두리 박스 그리드 */}
                                    <div className="casting-grid">
                                        {perf.casts && perf.casts.length > 0 ? (
                                            perf.casts.map((cast, cIdx) => (
                                                <div className="casting-box" key={cIdx}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="text-muted fw-semibold">{cast.roleName}:</span> 
                                                        <strong className="text-dark">{cast.actorName}</strong>
                                                    </div>
                                                    {cast.description && (
                                                        <div className="text-muted small mt-1 text-truncate" style={{ fontSize: '12px' }}>
                                                            {cast.description}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-muted small">등록된 캐스팅 정보가 없습니다.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted mb-0">현재 등록된 회차가 없습니다.</p>
                    </div>
                )}
            </div>
            
            {/* 하단 리뷰 관리 버튼 (카드 정중앙 배치 및 전용 보라색 버튼) */}
            <div className="concert-detail-card concert-detail-review-wrap">
                <button 
                    type="button" 
                    className="concert-detail-review-btn"
                    onClick={() => navigate(`/concert/${id}`)}
                >
                    💬 리뷰 관리하러 가기
                </button>
            </div>

        </div>
    );
}