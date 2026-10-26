import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ActorManage.css';

export default function ActorManage() {
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 모달 상태 (등록 모달 또는 수정 모달)
    const [selectedActor, setSelectedActor] = useState(null);
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const [editForm, setEditForm] = useState({
        actorName: "",
        description: ""
    });

    // 배우 목록 불러오기
    const fetchActors = async (p = 0, kw = '') => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get("/api/actor", {
                params: { page: p, keyword: kw },
                withCredentials: true,
                headers: { Accept: "application/json" },
            });

            const data = response.data;
            setActors(data.content || []);
            setTotalElements(data.totalElements || 0);
            setTotalPages(data.totalPages || 0);
            setPage(data.number || 0);
        } catch (err) {
            console.error("배우 조회 오류:", err);
            setError(err.message || "배우 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActors(page, keyword);
    }, [page]);

    // 검색 핸들러
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchActors(0, keyword);
    };

    if (loading && actors.length === 0) {
        return <section className="admin-members">배우 목록을 불러오는 중...</section>;
    }

    if (error) {
        return (
            <section className="admin-members">
                <h2>배우 목록 조회 실패</h2>
                <p>{error}</p>
            </section>
        );
    }

    // 등록 모달 열기
    const openRegisterModal = () => {
        setIsRegisterMode(true);
        setSelectedActor({});
        setEditForm({
            actorName: "",
            description: ""
        });
    };

    // 수정 모달 열기 (수정 버튼 클릭 시)
    const handleEditClick = (actor, e) => {
        e.stopPropagation(); // 행 클릭 이벤트 방지
        setIsRegisterMode(false);
        setSelectedActor(actor);
        setEditForm({
            actorName: actor.actorName ?? "",
            description: actor.description ?? ""
        });
    };

    // 모달 닫기
    const closeModal = () => {
        setSelectedActor(null);
        setIsRegisterMode(false);
    };

    // 등록 및 수정 요청 처리
    async function handleActorSubmit(e) {
        e.preventDefault();
        if (!selectedActor) return;

        try {
            if (isRegisterMode) {
                await axios.post("/api/actor/new", editForm, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
                alert("새 배우가 등록되었습니다.");
            } else {
                await axios.post(`/api/actor/update/${selectedActor.actorId}`, editForm, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
                alert("배우 정보가 수정되었습니다.");
            }
            closeModal();
            fetchActors(page, keyword);
        } catch (e) {
            console.error("배우 저장/수정 오류 발생 : ", e);
            alert(e.message || "요청 처리에 실패했습니다.");
        }
    }

    // 삭제 처리
    const handleDelete = async (actorId, e) => {
        e.stopPropagation();
        if (!window.confirm("정말 삭제하시겠습니까? (연관된 캐스팅의 배우 정보는 NULL로 처리됩니다)")) return;

        try {
            await axios.post(`/api/actor/delete/${actorId}`, {}, {
                withCredentials: true,
                headers: { Accept: "application/json" }
            });
            alert("삭제되었습니다.");
            fetchActors(page, keyword);
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제에 실패했습니다.");
        }
    };

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
            {/* 페이지 타이틀 */}
            <h2>배우 관리</h2>

            {/* [검색창과 '새 배우 등록' */}
            <div className="members-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flex: '1', minWidth: '240px', gap: '8px', margin: 0 }}>
                    <input
                        type="search"
                        placeholder="배우 이름 검색"
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
                    + 새 배우 등록
                </button>
            </div>

            <p className="members-result-count">
                검색 결과 총 <strong>{totalElements}</strong>명
            </p>
            <div className="members-table-wrapper">
                <table className="members-table">
                    <thead>
                        <tr>
                            <th>회원 번호 (ID)</th>
                            <th>배우 이름</th>
                            <th>설명</th>
                            <th style={{ textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {actors.length > 0 ? (
                            actors.map((actor) => (
                                <tr key={actor.actorId}
                                    className="member-row">
                                    <td>{actor.actorId}</td>
                                    <td><strong>{actor.actorName}</strong></td>
                                    <td>{actor.description || "설명 없음"}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            className="member-modal-confirm"
                                            style={{ padding: '4px 12px', minHeight: '30px', fontSize: '12px', marginRight: '6px' }}
                                            onClick={(e) => handleEditClick(actor, e)}
                                        >
                                            수정
                                        </button>
                                        <button
                                            type="button"
                                            className="member-modal-confirm"
                                            style={{ padding: '4px 12px', minHeight: '30px', fontSize: '12px', backgroundColor: '#d14343' }}
                                            onClick={(e) => handleDelete(actor.actorId, e)}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="members-empty">
                                    등록된 배우가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 페이징 네비게이션 */}
                {totalPages > 0 && (
                    <nav className="mt-4">
                        <ul className="pagination">
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

                {/* 등록 및 수정 모달 */}
                {selectedActor !== null && (
                    <div className="member-modal-backdrop" onClick={closeModal}>
                        <div
                            className="member-modal"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="actor-modal-title"
                        >
                            <form onClick={(e) => e.stopPropagation()} onSubmit={handleActorSubmit}>
                                <div className="member-modal-header">
                                    <h2 id="actor-modal-title">
                                        {isRegisterMode ? "새 배우 등록" : "배우 정보 수정"}
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

                                <div className="member-modal-body">
                                    {!isRegisterMode && (
                                        <div className="member-detail-row">
                                            <span>배우 ID</span>
                                            <strong>{selectedActor.actorId}</strong>
                                        </div>
                                    )}

                                    <div className="member-detail-row">
                                        <label htmlFor="actorName">배우 이름</label>
                                        <input 
                                            id="actorName"
                                            type="text" 
                                            placeholder="배우 이름을 입력하세요"
                                            value={editForm.actorName} 
                                            onChange={(e) => setEditForm({ ...editForm, actorName: e.target.value })} 
                                            required 
                                        />
                                    </div>

                                    <div className="member-detail-row">
                                        <label htmlFor="description">설명</label>
                                        <input 
                                            id="description"
                                            type="text" 
                                            placeholder="배우 설명을 입력하세요"
                                            value={editForm.description} 
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="member-modal-footer">
                                    <button type="submit" className="member-modal-confirm">
                                        {isRegisterMode ? "등록" : "수정"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="member-modal-confirm"
                                        style={{ backgroundColor: '#7b8497' }}
                                    >
                                        닫기
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}