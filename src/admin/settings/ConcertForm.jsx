import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConcertDetail.css';

export default function ConcertForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [concertName, setConcertName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('UPCOMING');
    const [venueId, setVenueId] = useState('');
    const [genreId, setGenreId] = useState('');
    const [runTimeMinutes, setRunTimeMinutes] = useState('');

    const [venues, setVenues] = useState([]);
    const [genres, setGenres] = useState([]);

    const [existingImgUrl, setExistingImgUrl] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. 장르 목록 로드
                const genreRes = await axios.get('/api/concert/genres', { withCredentials: true });
                const genreData = genreRes.data;
                const genreList = Array.isArray(genreData) ? genreData : (genreData.content || genreData.genres || []);
                setGenres(genreList);

                // 2. 장소 목록 로드 (VenueApiController의 Page 응답 구조인 .content를 정확히 추출)[cite: 5]
                const venueRes = await axios.get('/api/venue', { withCredentials: true });
                const venueData = venueRes.data;
                const venueList = Array.isArray(venueData) ? venueData : (venueData.content || venueData.venues || []);
                setVenues(venueList);

                // 3. 수정 모드일 경우 기존 콘서트 상세 데이터 세팅 및 매칭
                if (isEdit) {
                    const concertRes = await axios.get(`/api/concert/${id}`, { withCredentials: true });
                    const data = concertRes.data;

                    setConcertName(data.concertName || data.title || '');
                    setStartDate(data.startDate ? data.startDate.replace(' ', 'T').substring(0, 16) : '');
                    setEndDate(data.endDate ? data.endDate.replace(' ', 'T').substring(0, 16) : '');
                    setStatus(data.status || 'UPCOMING');
                    setRunTimeMinutes(data.runTimeMinutes || data.runningTime || '');
                    setExistingImgUrl(data.imgUrl || data.posterUrl || '');
                    
                    // 장소 ID 매칭 (ID가 있거나 이름으로 올 경우 모두 완벽 대응)
                    if (data.venueId) {
                        setVenueId(data.venueId);
                    } else if (data.venueName) {
                        const matched = venueList.find(v => v.venueName === data.venueName);
                        if (matched) setVenueId(matched.venueId);
                    }

                    // 장르 ID 매칭
                    if (data.genreId) {
                        setGenreId(data.genreId);
                    } else if (data.genreName) {
                        const matchedG = genreList.find(g => g.genreName === data.genreName);
                        if (matchedG) setGenreId(matchedG.genreId);
                    }
                }
            } catch (err) {
                console.error('데이터 초기화 중 에러 발생:', err);
            }
        };

        fetchData();
    }, [id, isEdit]);

    const handleFileChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!concertName) {
            alert('콘서트명을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        const concertData = {
            concertName,
            startDate,
            endDate,
            venueId: venueId ? Number(venueId) : null,
            genreId: genreId ? Number(genreId) : null,
            runTimeMinutes: runTimeMinutes ? Number(runTimeMinutes) : null,
            status
        };

        formData.append("dto", new Blob([JSON.stringify(concertData)], { type: "application/json" }));
        imageFiles.forEach((file) => {
            formData.append("imageFiles", file);
        });

        try {
            setLoading(true);
            let resId = id;

            if (isEdit) {
                await axios.post(`/api/concert/${id}/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
                alert('성공적으로 수정되었습니다!');
            } else {
                const res = await axios.post('/api/concert', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
                resId = res.data;
                alert('성공적으로 등록되었습니다!');
            }

            navigate(`/admin/settings/concert/${resId}`);
        } catch (err) {
            console.error('저장 실패:', err);
            alert(isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="concert-detail-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
            <div className="content-card">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: '#e8ebf2' }}>
                    <h2 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#202938' }}>
                        {isEdit ? '공연 수정' : '신규 공연 등록'}
                    </h2>
                    <button 
                        type="button" 
                        className="page-link-back" 
                        onClick={() => navigate(isEdit ? `/admin/settings/concert/${id}` : '/admin/settings/concert')}
                    >
                        <i className="fa-solid fa-arrow-left me-1.5"></i> 취소 / 돌아가기
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">콘서트명</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={concertName} 
                            onChange={(e) => setConcertName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">시작 일시</label>
                        <input 
                            type="datetime-local" 
                            className="form-control" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">콘서트 상태</label>
                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="UPCOMING">UPCOMING (공연 예정)</option>
                            <option value="ONGOING">ONGOING (공연 중)</option>
                            <option value="FINISHED">FINISHED (공연 종료)</option>
                            <option value="ISCANCELED">ISCANCELED (취소됨)</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">종료 일시</label>
                        <input 
                            type="datetime-local" 
                            className="form-control" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* 장소 선택 */}
                    <div className="mb-3">
                        <label className="form-label">장소 선택</label>
                        <select className="form-select" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                            <option value="">장소를 선택하세요</option>
                            {venues.map((venue) => (
                                <option key={venue.venueId} value={venue.venueId}>
                                    {venue.venueName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 장르 선택 */}
                    <div className="mb-3">
                        <label className="form-label">장르 선택</label>
                        <select className="form-select" value={genreId} onChange={(e) => setGenreId(e.target.value)}>
                            <option value="">장르를 선택하세요</option>
                            {genres.map((genre) => (
                                <option key={genre.genreId} value={genre.genreId}>
                                    {genre.genreName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">러닝타임 (분)</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            placeholder="120" 
                            value={runTimeMinutes} 
                            onChange={(e) => setRunTimeMinutes(e.target.value)} 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">공연 포스터 및 상세 이미지</label>
                        {isEdit && existingImgUrl && (
                            <div className="mb-2">
                                <img src={existingImgUrl} style={{ height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e8ebf2' }} alt="기존 이미지" />
                                <span className="text-muted ms-2 small">(새 이미지를 선택하면 변경됩니다)</span>
                            </div>
                        )}
                        <input type="file" className="form-control" multiple accept="image/*" onChange={handleFileChange} />
                        <div className="mt-2 text-muted small">
                            {imageFiles.length > 0 ? (
                                imageFiles.map((f, idx) => (
                                    <span key={idx} className="badge me-1" style={{ background: '#f0eaff', color: '#7456df', fontWeight: '600' }}>
                                        ✔️ {f.name}
                                    </span>
                                ))
                            ) : (
                                "선택된 파일이 없습니다."
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn-theme-primary w-100 py-2.5" disabled={loading}>
                        {loading ? '처리 중...' : (isEdit ? '수정 완료' : '등록 완료')}
                    </button>
                </form>
            </div>
        </div>
    );
}