import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PerformanceForm.css';

export default function PerformanceForm() {
    const { concertId, performanceId } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(performanceId);

    const [concert, setConcert] = useState(null);
    const [roles, setRoles] = useState([]);
    const [actors, setActors] = useState([]);

    const [performanceDate, setPerformanceDate] = useState('');
    const [bookingStart, setBookingStart] = useState('');
    const [bookingEnd, setBookingEnd] = useState('');
    const [status, setStatus] = useState('UPCOMING');
    const [casts, setCasts] = useState({}); // { roleId: actorId }
    
    // 실시간 유효성 검사 메시지 및 상태 관리
    const [errorMessage, setErrorMessage] = useState('');
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const concertRes = await axios.get(`/api/concert/${concertId}`, { withCredentials: true });
                setConcert(concertRes.data);

                const rolesRes = await axios.get(`/api/concert/${concertId}/roles`, { withCredentials: true });
                setRoles(rolesRes.data);
                
                const actorsRes = await axios.get(`/api/actor`, {
                    params: { page: 0, size: 100 },
                    withCredentials: true,
                    headers: { Accept: "application/json" },
                });

                const actorData = actorsRes.data;
                setActors(Array.isArray(actorData) ? actorData : (actorData.content || []));

                if (isEdit) {
                    const perfRes = await axios.get(`/api/concert/${concertId}/performance/${performanceId}`, { withCredentials: true });
                    const perfData = perfRes.data;

                    const performance = perfData.performance || perfData; 
                    const castsList = perfData.casts || performance.casts || [];

                    setPerformanceDate(performance.performanceDate ? performance.performanceDate.replace(' ', 'T').substring(0, 16) : '');
                    setBookingStart(performance.bookingStart ? performance.bookingStart.replace(' ', 'T').substring(0, 16) : '');
                    setBookingEnd(performance.bookingEnd ? performance.bookingEnd.replace(' ', 'T').substring(0, 16) : '');
                    setStatus(performance.status || 'UPCOMING');

                    if (Array.isArray(castsList)) {
                        const castMap = {};
                        castsList.forEach(c => {
                            const rId = c.roleId || (c.role && c.role.roleId);
                            const aId = c.actorId || (c.actor && c.actor.actorId);
                            if (rId && aId) {
                                castMap[rId] = aId;
                            }
                        });
                        setCasts(castMap);
                    }
                }
            } catch (err) {
                console.error('데이터 로드 실패', err);
            }
        };
        fetchInitialData();
    }, [concertId, performanceId, isEdit]);

    // 💡 핵심: 입력값이 바뀔 때마다 실시간으로 유효성 검사 수행
    useEffect(() => {
        if (!performanceDate && !bookingStart && !bookingEnd) {
            setErrorMessage('');
            setIsValid(true);
            return;
        }

        const perfDate = performanceDate ? new Date(performanceDate) : null;
        const bStart = bookingStart ? new Date(bookingStart) : null;
        const bEnd = bookingEnd ? new Date(bookingEnd) : null;

        // 1. 공연 운영 기간 검사 (부모 콘서트 일정과 비교)
        if (concert && perfDate) {
            const concertStart = concert.startDate ? new Date(concert.startDate) : null;
            const concertEnd = concert.endDate ? new Date(concert.endDate) : null;

            if (concertStart && perfDate < concertStart) {
                setErrorMessage(`⚠️ 공연 일시는 콘서트 시작일(${concert.startDate})보다 빠를 수 없습니다.`);
                setIsValid(false);
                return;
            }
            if (concertEnd && perfDate > concertEnd) {
                setErrorMessage(`⚠️ 공연 일시는 콘서트 종료일(${concert.endDate})보다 늦을 수 없습니다.`);
                setIsValid(false);
                return;
            }
        }

        // 2. 예매 시작일 / 마감일 관계 검사
        if (bStart && bEnd && bStart > bEnd) {
            setErrorMessage("⚠️ 예매 시작일은 예매 마감일보다 빠르거나 같아야 합니다.");
            setIsValid(false);
            return;
        }

        // 3. 예매 마감일과 공연 일시 관계 검사
        if (bEnd && perfDate && bEnd > perfDate) {
            setErrorMessage("⚠️ 예매 마감일은 공연 일시보다 이전이어야 합니다.");
            setIsValid(false);
            return;
        }

        // 모든 조건 충족 시 경고 해제
        setErrorMessage('');
        setIsValid(true);
    }, [performanceDate, bookingStart, bookingEnd, concert]);

    const handleSubmit = async () => {
        if (!isValid) {
            alert("입력한 일시 정보를 다시 확인해 주세요.");
            return;
        }

        if (!performanceDate) {
            alert("공연 일시를 입력해 주세요.");
            return;
        }

        const formattedCasts = Object.entries(casts).map(([roleId, actorId]) => ({
            roleId: parseInt(roleId),
            actorId: parseInt(actorId)
        })).filter(c => c.actorId);

        const requestData = {
            performanceDate,
            bookingStart: bookingStart || null,
            bookingEnd: bookingEnd || null,
            status,
            casts: formattedCasts
        };

        try {
            if (isEdit) {
                await axios.put(`/api/concert/${concertId}/performance/${performanceId}`, requestData, { withCredentials: true });
                alert("회차가 수정되었습니다!");
            } else {
                await axios.post(`/api/concert/${concertId}/performance`, requestData, { withCredentials: true });
                alert("회차가 등록되었습니다!");
            }
            navigate(`/admin/settings/concert/${concertId}`);
        } catch (err) {
            alert("처리에 실패했습니다.");
        }
    };

    return (
        <div className="perf-form-container">
            
            {/* 상단 뒤로가기 버튼 */}
            <div className="perf-top-bar">
                <button type="button" className="page-link-back" onClick={() => navigate(`/admin/settings/concert/${concertId}`)}>
                    <i className="fa-solid fa-arrow-left me-1.5"></i> 콘서트 상세로 돌아가기
                </button>
            </div>

            {concert && (
                <div className="alert-info-banner mb-4">
                    📌 <strong>공연 운영 기간:</strong> {concert.startDate} ~ {concert.endDate}
                </div>
            )}

            <h2 className="perf-main-title">{isEdit ? '콘서트 회차 및 캐스팅 수정' : '콘서트 회차 및 캐스팅 등록'}</h2>

            <div className="perf-split-layout">
                
                {/* 왼쪽 영역: 회차 정보 입력 */}
                <div className="form-card perf-left-pane">
                    <h4>회차 정보 입력</h4>
                    
                    <div className="mb-4">
                        <label className="form-label">공연 일시 *</label>
                        <input 
                            type="datetime-local" 
                            className={`form-control ${errorMessage && !isValid ? 'is-invalid' : ''}`}
                            value={performanceDate} 
                            onChange={(e) => setPerformanceDate(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label">예매 시작일</label>
                        <input 
                            type="datetime-local" 
                            className={`form-control ${errorMessage && !isValid ? 'is-invalid' : ''}`}
                            value={bookingStart} 
                            onChange={(e) => setBookingStart(e.target.value)} 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label">예매 마감일</label>
                        <input 
                            type="datetime-local" 
                            className={`form-control ${errorMessage && !isValid ? 'is-invalid' : ''}`}
                            value={bookingEnd} 
                            onChange={(e) => setBookingEnd(e.target.value)} 
                        />
                    </div>

                    {/* 💡 입력값이 틀릴 때 실시간으로 드러나는 경고창 */}
                    {errorMessage && (
                        <div className="alert alert-danger mb-4 p-3 rounded-3 fw-semibold small" style={{ backgroundColor: '#fff0f0', color: '#d14343', border: '1px solid #ffdcdc' }}>
                            {errorMessage}
                        </div>
                    )}

                    <div className="mb-2">
                        <label className="form-label">회차 상태</label>
                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="UPCOMING">예매예정</option>
                            <option value="ONGOING">예매중/공연중</option>
                            <option value="FINISHED">종료됨</option>
                        </select>
                    </div>
                </div>

                {/* 오른쪽 영역: 배역 및 배우 매칭 */}
                <div className="form-card perf-right-pane">
                    <h4>캐스팅 설정 (배역별 배우 매칭)</h4>
                    
                    <div className="perf-role-list-scroll">
                        {roles && roles.length > 0 ? (
                            roles.map((role) => (
                                <div key={role.roleId} className="perf-role-item-box">
                                    <div className="perf-role-meta">
                                        <span className="perf-role-name">{role.roleName}</span>
                                        {role.description && <span className="perf-role-desc">{role.description}</span>}
                                    </div>
                                    <div className="perf-actor-select-wrap">
                                        <select 
                                            className="form-select"
                                            value={casts[role.roleId] || ''}
                                            onChange={(e) => setCasts({ ...casts, [role.roleId]: e.target.value })}
                                        >
                                            <option value="">-- 배우 선택 --</option>
                                            {actors.map((actor) => (
                                                <option key={actor.actorId} value={actor.actorId}>{actor.actorName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-muted small">등록된 배역이 없습니다. 먼저 배역을 추가해주세요.</div>
                        )}
                    </div>
                </div>

            </div>

            {/* 하단 저장 버튼 (오류 시 비활성화) */}
            <div className="perf-submit-wrap">
                <button 
                    type="button" 
                    className="btn-theme-primary" 
                    onClick={handleSubmit}
                    disabled={!isValid || !performanceDate}
                    style={{ opacity: (!isValid || !performanceDate) ? 0.5 : 1, cursor: (!isValid || !performanceDate) ? 'not-allowed' : 'pointer' }}
                >
                    {isEdit ? '수정 완료하기' : '회차 등록하기'}
                </button>
            </div>

        </div>
    );
}