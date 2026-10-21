import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function FindPassword() {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        phonePrefix: "010",
        phoneMiddle: "",
        phoneLast: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [temporaryPassword, setTemporaryPassword] = useState("");

    // 입력값 변경
    const handleChange = (e) => {
        const { name, value } = e.target;

        const nextValue =
            name === "phoneMiddle" || name === "phoneLast"
                ? value.replace(/\D/g, "")
                : value;

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        setError("");
        setSuccess(false);
    };

    // 비밀번호 찾기 요청
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess(false);

        const {
            email,
            name,
            phonePrefix,
            phoneMiddle,
            phoneLast,
        } = formData;

        // 전화번호 유효성 검사
        if (!/^\d{3,4}$/.test(phoneMiddle)) {
            setError("전화번호 가운데 자리를 확인해주세요.");
            return;
        }

        if (!/^\d{4}$/.test(phoneLast)) {
            setError("전화번호 마지막 자리를 확인해주세요.");
            return;
        }

        // 백엔드에 전달할 데이터
        const requestData = {
            email,
            name,
            phone: `${phonePrefix}-${phoneMiddle}-${phoneLast}`,
        };

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost/api/member/find-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "회원 정보를 확인할 수 없습니다."
                );
            }
            // 임시 비번 저장
            setTemporaryPassword(data.trim());
            // 성공 화면 표시
            setSuccess(true);
        } catch (err) {
            setError(
                err.data || "서버와 통신할 수 없습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* 로고 */}
            <div className="login-logo">
                <Link to="/">HOON HOme</Link>
                <p>HOME & LIVING</p>
            </div>

            {/* 비밀번호 찾기 카드 */}
            <div className="login-card">
                <div className="login-heading">
                    <span>RESET YOUR PASSWORD</span>

                    <h1>비밀번호 찾기</h1>

                    <p>
                        가입할 때 입력한 회원 정보를 입력해주세요.
                        <br />
                        본인 확인 후 비밀번호 재설정을 진행합니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* 이메일 */}
                    <div className="login-form-group">
                        <label htmlFor="email">이메일</label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="가입한 이메일을 입력하세요."
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 이름 */}
                    <div className="login-form-group">
                        <label htmlFor="name">이름</label>

                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="가입할 때 입력한 이름"
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 전화번호 */}
                    <div className="login-form-group">
                        <label htmlFor="phonePrefix">
                            전화번호
                        </label>

                        <div className="phone-number-row">
                            <select
                                id="phonePrefix"
                                name="phonePrefix"
                                value={formData.phonePrefix}
                                onChange={handleChange}
                                aria-label="전화번호 앞자리"
                                required
                            >
                                <option value="010">010</option>
                            </select>

                            <span className="phone-hyphen">-</span>

                            <input
                                type="text"
                                id="phoneMiddle"
                                name="phoneMiddle"
                                value={formData.phoneMiddle}
                                onChange={handleChange}
                                placeholder="1234"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={4}
                                pattern="[0-9]{3,4}"
                                aria-label="전화번호 가운데 자리"
                                required
                            />

                            <span className="phone-hyphen">-</span>

                            <input
                                type="text"
                                id="phoneLast"
                                name="phoneLast"
                                value={formData.phoneLast}
                                onChange={handleChange}
                                placeholder="5678"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                aria-label="전화번호 마지막 자리"
                                required
                            />
                        </div>
                    </div>

                    {/* 오류 메시지 */}
                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    {/* 성공 메시지 */}
                    {success && (
                        <div className="login-logout" role="status">
                            <p>임시 비밀번호가 발급되었습니다.</p>

                            <strong>{temporaryPassword}</strong>

                            <p>
                                임시 비밀번호로 로그인한 후 비밀번호를 변경해주세요.
                            </p>
                        </div>
                    )}

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "확인 중..."
                            : "비밀번호 찾기"}
                    </button>
                </form>

                {/* 하단 링크 */}
                <div className="login-find-links">
                    <Link to="/member/login">로그인</Link>
                    <span>|</span>
                    <Link to="/member/find-id">아이디 찾기</Link>
                    <span>|</span>
                    <Link to="/member/signup">회원가입</Link>
                </div>
            </div>
        </div>
    );
}

export default FindPassword;