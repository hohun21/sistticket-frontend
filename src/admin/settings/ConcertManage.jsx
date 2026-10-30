import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConcertManage.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ConcertManage() {
    const navigate = useNavigate();
    const [concerts, setConcerts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    const [genreId, setGenreId] = useState('');
    const [type, setType] = useState('nv');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    const genres = [
        { id: '', name: '전체보기' },
        { id: 1, name: '아이돌' },
        { id: 2, name: '발라드/R&B' },
        { id: 3, name: '힙합/EDM' },
        { id: 4, name: '페스티벌' },
        { id: 5, name: '인디/록' },
        { id: 6, name: '내한' },
        { id: 7, name: '뮤지컬' },
        { id: 8, name: '연극' },
    ];

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '일시 정보 없음';
        const str = dateTimeStr.toString().replace('T', ' ');
        const parts = str.split(' ');
        const datePart = parts[0] || '';
        let timePart = parts[1] || '';
        if (timePart.includes('.')) {
            timePart = timePart.split('.')[0];
        }
        return timePart ? `${datePart} ${timePart}` : datePart;
    };

    const fetchConcerts = async (p = 0, gId = genreId, t = type, kw = searchKeyword) => {
        try {
            setLoading(true);
            const res = await axios.get('/api/concert', {
                params: {
                    page: p,
                    size: 9,
                    genreId: gId !== '' ? gId : null,
                    type: t,
                    searchKeyword: kw
                },
                withCredentials: true
            });

            const data = res.data;
            setConcerts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setPage(data.number || 0);
        } catch (err) {
            console.error('콘서트 목록 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConcerts(0, genreId, type, searchKeyword);
    }, [genreId]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchConcerts(0, genreId, type, searchKeyword);
    };

    const handleReset = () => {
        setSearchKeyword('');
        setType('nv');
        setGenreId('');
        fetchConcerts(0, '', 'nv', '');
    };

    return (
        <div className="concert-admin-container">

            {/* 상단 헤더 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <a href="/admin/settings/main" style={{ textDecoration: 'none' }}>
                        <button type="button" className="concert-admin-back-btn">
                            <i className="fa-solid fa-arrow-left me-1"></i> 관리자 메인으로
                        </button>
                    </a>
                    <h2 className="fw-bold mt-3 mb-1" style={{ fontSize: '28px', letterSpacing: '-0.8px', color: '#202938' }}>
                        <i className="fa-solid fa-microphone-lines me-2" style={{ color: '#7456df' }}></i>공연 관리 대시보드
                    </h2>
                    <p className="text-muted small mb-0" style={{ fontSize: '14px' }}>등록된 전체 공연 및 뮤지컬 정보를 직관적으로 관리할 수 있습니다.</p>
                </div>
            </div>

            {/* 툴바 영역 (검색창과 등록 버튼 나란히 배치) */}
            <div className="concert-toolbar-wrapper">
                <form onSubmit={handleSearch} className="concert-search-form">
                    <select name="type" className="form-select px-3" style={{ width: '140px', flexShrink: 0 }} value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="nv">전체 (제목+장소)</option>
                        <option value="n">공연명</option>
                        <option value="v">공연장</option>
                    </select>
                
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                            <i className="fa-solid fa-search"></i>
                        </span>
                        <input 
                            type="text" 
                            name="searchKeyword" 
                            className="form-control border-start-0 py-2" 
                            style={{ borderRadius: '0 10px 10px 0' }}
                            placeholder="검색어를 입력하세요" 
                            value={searchKeyword} 
                            onChange={(e) => setSearchKeyword(e.target.value)} 
                        />
                    </div>
                
                    <button type="submit" className="concert-admin-search-btn px-4">
                        <i className="fa-solid fa-magnifying-glass me-1"></i>검색
                    </button>
                    <button type="button" onClick={handleReset} className="concert-admin-reset-btn px-3">
                        초기화
                    </button>
                </form>

                <Link 
                    to="/admin/settings/concert/new" 
                    className="concert-admin-register-btn text-decoration-none"
                >
                    <i className="fa-solid fa-plus me-1.5"></i> 콘서트/뮤지컬 등록하기
                </Link>
            </div>
                
            {/* 장르별 탭 메뉴 */}
            <div className="d-flex justify-content-center mb-4">
                <ul className="concert-admin-pills">
                    {genres.map((g) => (
                        <li key={g.id}>
                            <button 
                                type="button"
                                className={`concert-admin-pill-link ${genreId === g.id ? 'active' : ''}`}
                                onClick={() => setGenreId(g.id)}
                            >
                                {g.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div> 

            {/* 3열(3x3) Grid */}
            <div className="concert-grid-3">
                {concerts.length > 0 ? (
                    concerts.map((concert) => {
                        const cid = concert.concertId || concert.id;
                        return (
                            <div className="concert-card-item" key={cid}>
                                <div className="concert-card-img-wrap">
                                    {concert.imgUrl || concert.posterUrl ? (
                                        <img 
                                            src={concert.imgUrl || concert.posterUrl} 
                                            alt={concert.concertName || concert.title} 
                                        />
                                    ) : (
                                        <div className="concert-no-image">
                                            <i className="fa-regular fa-image fa-2x"></i>
                                            <span>이미지 준비중...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="concert-card-body">
                                    <div className="mb-2">
                                        <span className="badge rounded-pill" style={{ background: '#f0eaff', color: '#7456df', fontSize: '12px', fontWeight: '750', padding: '5px 12px' }}>
                                            {concert.genreName || '장르미정'}
                                        </span>
                                    </div>
                                    <h5 className="concert-card-title text-truncate" title={concert.concertName || concert.title}>
                                        {concert.concertName || concert.title}
                                    </h5>
                                    <p className="concert-card-info">
                                        <i className="fa-solid fa-location-dot text-danger me-1"></i>
                                        <span className="text-truncate">{concert.venueName || '공연장 미정'}</span>
                                    </p>
                                    <p className="concert-card-info">
                                        <i className="fa-regular fa-calendar-days text-primary me-1"></i>
                                        <span>{formatDateTime(concert.startDate)}</span> ~ <span>{formatDateTime(concert.endDate)}</span>
                                    </p>
                                    <p className="concert-card-info mt-auto mb-0" style={{ color: '#7b8497' }}>
                                        <i className="fa-regular fa-clock me-1"></i> 러닝타임: <strong style={{ color: '#202938' }}>{concert.runTimeMinutes || concert.runningTime || 120}분</strong>
                                    </p>
                                </div>
                                <div className="concert-card-footer">
                                    <button 
                                        type="button"
                                        className="concert-card-edit-btn" 
                                        onClick={() => navigate(`/admin/settings/concert/edit/${cid}`)}
                                    >
                                        <i className="fa-solid fa-pen-to-square me-1"></i> 수정하기
                                    </button>
                                    <button 
                                        type="button"
                                        className="concert-card-detail-btn" 
                                        onClick={() => navigate(`/admin/settings/concert/${cid}`)}
                                    >
                                        상세보기
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '16px', border: '1px solid #e8ebf2' }}>
                        <i className="fa-regular fa-folder-open fa-3x text-muted mb-3"></i>
                        <p className="text-muted mb-0" style={{ fontSize: '15px' }}>해당 조건에 등록된 공연이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 페이징 네비게이션 */}
            {totalPages > 0 && (
                <nav className="concert-admin-nav">
                    <ul className="concert-admin-pagination">
                        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                            <button type="button" className="page-link" onClick={() => fetchConcerts(page - 1)}>이전</button>
                        </li>
                        
                        {[...Array(totalPages)].map((_, num) => (
                            <li className={`page-item ${num === page ? 'active' : ''}`} key={num}>
                                <button type="button" className="page-link" onClick={() => fetchConcerts(num)}>{num + 1}</button>
                            </li>
                        ))}
                        
                        <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                            <button type="button" className="page-link" onClick={() => fetchConcerts(page + 1)}>다음</button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}