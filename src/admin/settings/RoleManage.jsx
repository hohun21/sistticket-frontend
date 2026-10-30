import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoleManage.css';

export default function RoleManagement() {
    const { concertId } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');

    const fetchRoles = async () => {
        try {
            const res = await axios.get(`/api/concert/${concertId}/roles`, { withCredentials: true });
            setRoles(res.data);
        } catch (e) {
            console.error('배역 목록 로드 실패', e);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [concertId]);

    const handleRegister = async () => {
        if (!roleName) {
            alert("배역 이름을 입력해주세요.");
            return;
        }
        try {
            await axios.post(`/api/concert/${concertId}/roles`, { roleName, description }, { withCredentials: true });
            setRoleName('');
            setDescription('');
            fetchRoles();
        } catch (e) {
            alert("배역 등록에 실패했습니다.");
        }
    };

    const handleUpdate = async (roleId, currentName, currentDesc) => {
        const newName = prompt("수정할 배역 이름을 입력하세요:", currentName);
        if (newName === null) return;
        const newDesc = prompt("수정할 배역 설명을 입력하세요:", currentDesc);

        try {
            await axios.put(`/api/concert/${concertId}/roles/${roleId}`, { roleName: newName, description: newDesc }, { withCredentials: true });
            fetchRoles();
        } catch (e) {
            alert("배역 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (roleId) => {
        if (!window.confirm("정말 이 배역을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/api/concert/${concertId}/roles/${roleId}`, { withCredentials: true });
            fetchRoles();
        } catch (e) {
            alert("삭제에 실패했습니다.");
        }
    };

    return (
        <div className="role-manage-container">
            
            {/* 상단 뒤로가기 버튼 */}
            <div className="role-top-bar">
                <button type="button" className="page-link-back" onClick={() => navigate(`/admin/settings/concert/${concertId}`)}>
                    <i className="fa-solid fa-arrow-left me-1.5"></i> 콘서트 상세로 돌아가기
                </button>
            </div>

            <h2 className="role-main-title">콘서트 배역 관리</h2>

            {/* 좌우 2분할 레이아웃 (왼쪽: 배역 등록 / 오른쪽: 등록된 배역 목록) */}
            <div className="role-split-layout">
                
                {/* 왼쪽: 새 배역 추가 폼 */}
                <div className="form-card">
                    <h4>새 배역 추가</h4>
                    <div className="mb-4">
                        <label className="form-label">배역 이름</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="예: 주연, 조연, 앙상블 등" 
                            value={roleName} 
                            onChange={(e) => setRoleName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">배역 설명</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="배역에 대한 간단한 설명을 입력하세요" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                        />
                    </div>
                    <button type="button" className="btn-theme-primary w-100 py-3" onClick={handleRegister}>
                        배역 추가하기
                    </button>
                </div>

                {/* 오른쪽: 등록된 배역 목록 */}
                <div className="form-card">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: '#e8ebf2' }}>
                        <h4 className="mb-0">등록된 배역 목록</h4>
                        <span className="text-muted small">총 {roles.length}개 배역</span>
                    </div>

                    <div className="role-list-scroll">
                        {roles && roles.length > 0 ? (
                            roles.map((role) => (
                                <div key={role.roleId} className="role-item-box">
                                    <div className="role-info">
                                        <span className="role-name">{role.roleName}</span>
                                        <span className="role-desc">{role.description || '설명 없음'}</span>
                                    </div>
                                    <div className="role-action-btns">
                                        <button className="btn-action-edit" onClick={() => handleUpdate(role.roleId, role.roleName, role.description)}>수정</button>
                                        <button className="btn-action-delete" onClick={() => handleDelete(role.roleId)}>삭제</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 text-muted small">
                                등록된 배역이 없습니다. 왼쪽 폼에서 배역을 추가해보세요.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}