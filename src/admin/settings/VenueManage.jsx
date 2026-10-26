import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActorManage.css'; // 기존 관리자용 CSS 재활용

export default function VenueManage() {
    const [venues, setVenues] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 모달 제어 상태 (등록 모달 또는 수정 모달)
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    // 폼 입력 상태
    const [editForm, setEditForm] = useState({
        venueName: '',
        address: '',
        detailAddress: '',
        capacity: 1000
    });

    // 장소 목록 불러오기 (서버 페이징 및 키워드 검색)
    const fetchVenues = async (p = 0, kw = '') => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get('/api/venue', {
                params: { page: p, keyword: kw },
                withCredentials: true,
                headers: { Accept: "application/json" }
            });

            const data = res.data;
            setVenues(data.content || []);
            setTotalElements(data.totalElements || 0);
            setTotalPages(data.totalPages || 0);
            setPage(data.number || 0);
        } catch (err) {
            console.error('장소 목록 조회 실패:', err);
            setError(err.message || "장소 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues(page, keyword);
    }, [page]);

    // 검색 핸들러
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchVenues(0, keyword);
    };

    // 등록 모달 열기
    const openRegisterModal = () => {
        setIsRegisterMode(true);
        setSelectedVenue({});
        setEditForm({
            venueName: '',
            address: '',
            detailAddress: '',
            capacity: 1000
        });
    };

    // 수정 모달 열기
    const openUpdateModal = (venue, e) => {
        e.stopPropagation();
        setIsRegisterMode(false);
        setSelectedVenue(venue);
        setEditForm({
            venueName: venue.venueName || '',
            address: venue.address || '',
            detailAddress: venue.detailAddress || '',
            capacity: venue.capacity || 1000
        });
    };

    // 모달 닫기
    const closeModal = () => {
        setSelectedVenue(null);
        setIsRegisterMode(false);
    };

    // 등록 및 수정 통합 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegisterMode) {
                await axios.post('/api/venue/new', editForm, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                });
                alert('성공적으로 등록되었습니다!');
            } else {
                await axios.post(`/api/venue/update/${selectedVenue.venueId}`, editForm, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                });
                alert('수정되었습니다!');
            }
            closeModal();
            fetchVenues(page, keyword);
        } catch (err) {
            console.error('요청 실패:', err);
            alert('처리에 실패했습니다.');
        }
    };

    // 장소 삭제
    const handleDelete = async (venueId, e) => {
        e.stopPropagation();
        if (!window.confirm('정말 삭제하시겠습니까? (관련 콘서트의 장소 정보는 NULL로 처리됩니다)')) return;
        try {
            await axios.post(`/api/venue/delete/${venueId}`, {}, { withCredentials: true });
            alert('삭제되었습니다.');
            fetchVenues(page, keyword);
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('삭제에 실패했습니다.');
        }
    };

    if (loading && venues.length === 0) {
        return <section className="admin-members">장소 목록을 불러오는 중...</section>;
    }

    if (error) {
        return (
            <section className="admin-members">
                <h2>장소 목록 조회 실패</h2>
                <p>{error}</p>
            </section>
        );
    }

    return (
        <section className="admin-members">
            {/* 관리홈으로 가기 */}
            <div className="mb-3">
                <a href="/admin/settings/main" className="venue-back-link">
                    <button type="button" className="btn-back venue-back-btn">
                        <i className="fa-solid fa-arrow-left me-1"></i>
                        이전으로
                    </button>
                </a>
            </div>

            {/* 페이지 타이틀 & 상단 액션 바 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>장소 관리</h2>
                    <p className="text-muted small mb-0" style={{ fontSize: '13px' }}>공연이 개최되는 장소 및 공연장 정보를 관리합니다.</p>
                </div>
            </div>

            {/* 검색 및 툴바 영역 (일직선 배치) */}
            <div className="members-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flex: '1', minWidth: '240px', gap: '8px', margin: 0 }}>
                    <input
                        type="search"
                        placeholder="장소 이름 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ flex: 1, margin: 0 }}
                    />
                    <button type="submit" className="member-modal-confirm" style={{ minWidth: '80px', height: '44px', flexShrink: 0 }}>
                        검색
                    </button>
                </form>

                <button 
                    type="button" 
                    className="member-modal-confirm" 
                    onClick={openRegisterModal}
                    style={{ height: '44px', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                    <i className="fa-solid fa-plus me-1.5"></i> 새 장소 등록
                </button>
            </div>

            <p className="members-result-count">
                총 <strong style={{ color: '#635bdb' }}>{totalElements}</strong>개의 장소가 등록되어 있습니다.
            </p>

            {/* 테이블 영역 */}
            <div className="members-table-wrapper">
                <table className="members-table text-center align-middle">
                    <thead>
                        <tr>
                            <th style={{ width: '8%' }}>ID</th>
                            <th style={{ width: '22%' }}>장소 이름</th>
                            <th style={{ width: '30%', textAlign: 'left' }}>주소 / 상세주소</th>
                            <th style={{ width: '15%' }}>수용 인원</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venues.length > 0 ? (
                            venues.map((venue) => (
                                <tr key={venue.venueId} className="member-row">
                                    <td className="fw-bold text-muted">{venue.venueId}</td>
                                    <td><strong>{venue.venueName}</strong></td>
                                    <td className="text-muted text-start">
                                        <div>{venue.address}</div>
                                        <small className="text-secondary">{venue.detailAddress}</small>
                                    </td>
                                    <td>
                                        <span className="badge bg-light text-dark px-2 py-1" style={{ fontSize: '12px' }}>
                                            {Number(venue.capacity).toLocaleString()}명
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            className="member-modal-confirm"
                                            style={{
                                                padding: '4px 12px',
                                                minHeight: '30px',
                                                fontSize: '12px',
                                                marginRight: '6px'
                                            }}
                                            onClick={(e) => openUpdateModal(venue, e)}
                                        >
                                            수정
                                        </button>
                                        <button
                                            type="button"
                                            className="member-modal-confirm"
                                            style={{ padding: '4px 12px', minHeight: '30px', fontSize: '12px', backgroundColor: '#d14343' }}
                                            onClick={(e) => handleDelete(venue.venueId, e)}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="members-empty">
                                    등록되거나 검색된 장소가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이징 네비게이션 */}
            {totalPages > 0 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center mb-0">
                        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                            <button type="button" className="page-link" onClick={() => setPage(page - 1)}>이전</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                                <button type="button" className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                            <button type="button" className="page-link" onClick={() => setPage(page + 1)}>다음</button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* [모달] 새 장소 등록 및 수정 팝업 */}
            {selectedVenue !== null && (
                <div className="member-modal-backdrop" onClick={closeModal}>
                    <div
                        className="member-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                            <div className="member-modal-header" style={{ background: '#7456df', color: '#fff' }}>
                                <h2 style={{ color: '#fff', fontSize: '18px' }}>
                                    <i className="fa-solid fa-building-user me-1"></i> 
                                    {isRegisterMode ? "새 장소 등록" : "장소 정보 수정"}
                                </h2>
                                <button
                                    type="button"
                                    className="member-modal-close"
                                    onClick={closeModal}
                                    aria-label="모달 닫기"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="member-modal-body p-4">
                                {!isRegisterMode && (
                                    <div className="member-detail-row">
                                        <span>장소 ID</span>
                                        <strong>{selectedVenue.venueId}</strong>
                                    </div>
                                )}

                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold small text-secondary">장소 이름</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ width: '100%', maxWidth: '100%', marginLeft: 0, height: '40px', borderRadius: '8px' }}
                                        placeholder="장소 이름을 입력하세요" 
                                        value={editForm.venueName} 
                                        onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })} 
                                        required 
                                    />
                                </div>

                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold small text-secondary">주소</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ width: '100%', maxWidth: '100%', marginLeft: 0, height: '40px', borderRadius: '8px' }}
                                        placeholder="예: 서울특별시 송파구" 
                                        value={editForm.address} 
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} 
                                    />
                                </div>

                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold small text-secondary">상세 주소</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ width: '100%', maxWidth: '100%', marginLeft: 0, height: '40px', borderRadius: '8px' }}
                                        placeholder="예: 올림픽공원 내" 
                                        value={editForm.detailAddress} 
                                        onChange={(e) => setEditForm({ ...editForm, detailAddress: e.target.value })} 
                                    />
                                </div>

                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold small text-secondary">수용 인원 (Capacity)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        style={{ width: '100%', maxWidth: '100%', marginLeft: 0, height: '40px', borderRadius: '8px' }}
                                        placeholder="예: 15000" 
                                        value={editForm.capacity} 
                                        onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="member-modal-footer px-4 py-3 bg-light">
                                <button type="button" className="btn btn-secondary btn-sm rounded-2 px-3 py-2" onClick={closeModal}>취소</button>
                                <button type="submit" className="member-modal-confirm py-2 px-3" style={{ minHeight: '38px' }}>
                                    {isRegisterMode ? "등록하기" : "수정하기"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}