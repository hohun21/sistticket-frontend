import React, {useEffect, useMemo, useState} from 'react'
import "./AdminMembers.css"

function AdminMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    //
    const [selectedMember, setSelectedMember] = useState(null);
    const [editForm, setEditForm] = useState({
        password: "",
        status: "1",
        role: "USER"
    });

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/admin/members", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                });

                console.log("HTTP 상태 코드:", response.status);

                if (!response.ok) {
                    throw new Error(
                        `회원 목록 조회 실패: HTTP ${response.status}`
                    );
                }

                const data = await response.json();

                console.log("백엔드 응답 데이터:", data);

                const memberList = Array.isArray(data)
                    ? data
                    : Array.isArray(data.content)
                        ? data.content
                        : [];

                setMembers(memberList);
            } catch (err) {
                console.error("회원 조회 오류:", err);
                setError(
                    err.message || "회원 목록을 불러오지 못했습니다."
                );
            } finally {
                // 요청 성공 여부와 관계없이 로딩 종료
                setLoading(false);
            }
        };

        void fetchMembers();
    }, []);
    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const keyword = searchTerm.trim().toLowerCase();
            const matchesSearch =
                String(member.name ?? "").toLocaleLowerCase().includes(keyword) ||
                String(member.email ?? "").toLowerCase().includes(keyword) ||
                String(member.phone ?? "").includes(keyword);
            const matchesRole =
                roleFilter === "ALL" ||
                (member.roles ?? []).includes(roleFilter);

            const matchesStatus =
                statusFilter === "ALL" ||
                Number(member.status) === Number(statusFilter);
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [members, searchTerm, roleFilter, statusFilter]);
    if (loading) {
        return <section className={"admin-members"}>회원 목록을 불러오는 중...</section>;
    }
    if (error) {
        return (
            <section className="admin-members">
                <h2>회원 목록 조회 실패</h2>
                <p>{error}</p>
            </section>
        );
    }

    function handleRowClick(member) {
        setSelectedMember(member);

        setEditForm({
            password: "",
            status: String(member.status ?? 1),
            role: member.roles?.[0] ?? "USER"
        });
    }

    const closeModal = () => {
        setSelectedMember(null);
    }
    const getStatusLabel = (status) => {
        switch (Number(status)) {
            case 1:
                return "정상";
            case 0:
                return "탈퇴/삭제";
            case -1:
                return "정지";
            default:
                return "알 수 없음";
        }
    };

    async function handleMemberUpdate(e) {
        e.preventDefault();

        if (!selectedMember) return;

        const payload = {
            status: Number(editForm.status),
            roles: [editForm.role],
            password: editForm.password === "" ? null : editForm.password
        };
        try {
            const response = await fetch(`/api/admin/members/${selectedMember.memberId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(
                    `회원 수정 실패: HTTP ${response.status}`
                )
            }
            // 서버 수정 성공 후 화면의 회원 목록도 갱신
            setMembers((prev) =>
                prev.map((member) =>
                    String(member.memberId) === String(selectedMember.memberId)
                        ? {
                            ...member,
                            status: Number(editForm.status),
                            roles: [editForm.role],
                        }
                        : member
                )
            );
            alert(" 회원 정보가 수정 되었습니다. ")
            closeModal();
        } catch (e) {
            console.error("회원 수정 오류 발생 : " ,e);
            alert(e.message || " 회원 수정 실패했습니다. ");
        }
    }

    return (
        <section className="admin-members">
            <h2>회원 관리</h2>

            <div className="members-toolbar">
                <input
                    type="search"
                    placeholder="이름, 이메일, 전화번호 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="ALL">전체 권한</option>
                    <option value="USER">일반 회원</option>
                    <option value="ADMIN">관리자</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">전체 상태</option>
                    <option value="1">정상</option>
                    <option value="0">탈퇴/삭제</option>
                    <option value="-1">정지</option>
                </select>
            </div>

            <p className="members-result-count">
                검색 결과 <strong>{filteredMembers.length}</strong>명
            </p>

            <div className="members-table-wrapper">
                <table className="members-table">
                    <thead>
                    <tr>
                        <th>회원 번호</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>전화번호</th>
                        <th>권한</th>
                        <th>상태</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                            <tr key={member.memberId}
                                onClick={() => handleRowClick(member)}
                                style={{cursor: "pointer"}}
                                className={"member-row"}>
                                <td>{member.memberId}</td>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
                                <td>{member.phone}</td>
                                <td>
                                    {(member.roles ?? [])
                                        .map(role => role === "ADMIN" ? "관리자" : role === "USER" ? "일반 회원" : role)
                                        .join(", ")}
                                </td>
                                <td>{getStatusLabel(member.status)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="members-empty">
                                회원 데이터가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                {/*모달*/}
                {selectedMember && (
                    <div className="member-modal-backdrop" onClick={closeModal}>
                        <div
                            className="member-modal"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="member-modal-title"
                        >
                            <form className={"member-modal"}
                                  onClick={(e) => e.stopPropagation()}
                                  onSubmit={handleMemberUpdate}>
                                <div className="member-modal-header">
                                    <h2 id="member-modal-title">회원 상세 정보</h2>

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
                                    <div className="member-detail-row">
                                        <span>회원 번호</span>
                                        <strong>{selectedMember.memberId}</strong>
                                    </div>

                                    <div className="member-detail-row">
                                        <span>이름</span>
                                        <strong>{selectedMember.name}</strong>
                                    </div>

                                    <div className="member-detail-row">
                                        <span>이메일</span>
                                        <strong>{selectedMember.email}</strong>
                                    </div>
                                    <div className="member-detail-row">
                                        <span>비밀번호</span>
                                    <input id={"editPassword"}
                                           type={"password"}
                                           autoComplete={"new-password"}
                                           placeholder={"변경할 때만 입력"}
                                           value={editForm.password}
                                           onChange={(e) =>
                                               setEditForm({
                                                   ...editForm, password: e.target.value
                                               })}/>
                                    </div>
                                    <div className="member-detail-row">
                                        <span>전화번호</span>
                                        <strong>{selectedMember.phone || "-"}</strong>
                                    </div>

                                    <div className="member-detail-row">
                                        <label htmlFor="editRole">권한</label>
                                        <select
                                            id="editRole"
                                            value={editForm.role}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    role: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="USER">일반 회원</option>
                                            <option value="ADMIN">관리자</option>
                                        </select>
                                    </div>

                                    <div className="member-detail-row">
                                        <label htmlFor="editStatus">상태</label>
                                        <select
                                            id="editStatus"
                                            value={editForm.status}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="1">정상</option>
                                            <option value="0">탈퇴/삭제</option>
                                            <option value="-1">정지</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="member-modal-footer">
                                    <button type={"submit"} className="member-modal-confirm"> 수정</button>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="member-modal-confirm"
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

export default AdminMembers
