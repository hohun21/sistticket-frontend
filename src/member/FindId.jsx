import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function FindId() {
    const [formData, setFormData] = useState({
        name: "",
        phonePrefix: "010",
        phoneMiddle: "",
        phoneLast: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [foundEmail, setFoundEmail] = useState("");

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
        setFoundEmail("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFoundEmail("");

        const { name, phonePrefix, phoneMiddle, phoneLast } = formData;

        // 전화번호 가운데 자리 검사
        if (!/^\d{3,4}$/.test(phoneMiddle)) {
            setError("전화번호 가운데 자리를 확인해주세요.");
            return;
        }

        // 전화번호 마지막 자리 검사
        if (!/^\d{4}$/.test(phoneLast)) {
            setError("전화번호 마지막 자리를 확인해주세요.");
            return;
        }

        // 전화번호 조합
        const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;

        // GET 요청에 사용할 쿼리 파라미터 생성
        const params = new URLSearchParams({
            name,
            phone,
        });

        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost/api/member/find-id?${params.toString()}`
            );

            const data = await response.text();

            console.log("HTTP 상태:", response.status);
            console.log("서버 응답:", data);
            // HTTP 응답 실패 처리
            if (!response.ok) {

                throw new Error(
                    data.message || "일치하는 회원 정보를 찾을 수 없습니다."
                );
            }

            // 이메일 응답 확인
            if (!data.trim()) {
                throw new Error("조회된 이메일이 없습니다.");
            }

            setFoundEmail(data.trim());

        } catch (err) {
            setError(
                err.message || "서버와 통신할 수 없습니다."
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

            {/* 아이디 찾기 카드 */}
            <div className="login-card">
                <div className="login-heading">
                    <span>FIND YOUR ACCOUNT</span>
                    <h1>아이디 찾기</h1>
                    <p>
                        가입할 때 입력한 이름과 전화번호로
                        <br />
                        아이디(이메일)를 찾을 수 있습니다.
                    </p>
                </div>

                {foundEmail ? (
                    <div className="find-id-result">
                        <p>회원님의 아이디를 찾았습니다.</p>

                        <strong>{foundEmail}</strong>

                        <Link
                            to="/member/login"
                            className="find-id-login-button"
                        >
                            로그인하러 가기
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
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
                                >
                                    <option value="010">010</option>
                                </select>

                                <span className="phone-hyphen">-</span>

                                <input
                                    type="text"
                                    name="phoneMiddle"
                                    value={formData.phoneMiddle}
                                    onChange={handleChange}
                                    placeholder="1234"
                                    inputMode="numeric"
                                    maxLength={4}
                                    pattern="[0-9]{3,4}"
                                    aria-label="전화번호 가운데 자리"
                                    required
                                />

                                <span className="phone-hyphen">-</span>

                                <input
                                    type="text"
                                    name="phoneLast"
                                    value={formData.phoneLast}
                                    onChange={handleChange}
                                    placeholder="5678"
                                    inputMode="numeric"
                                    maxLength={4}
                                    pattern="[0-9]{4}"
                                    aria-label="전화번호 마지막 자리"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="login-error" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "아이디 확인 중..."
                                : "아이디 찾기"}
                        </button>
                    </form>
                )}

                <div className="login-find-links">
                    <Link to="/member/login">로그인</Link>
                    <span>|</span>
                    <Link to="/member/signup">회원가입</Link>
                    <span>|</span>
                    <Link to="/member/find-password">
                        비밀번호 찾기
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default FindId;