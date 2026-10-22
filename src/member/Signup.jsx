import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import "./SignupEmail.css";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phonePrefix: "010",
        phoneMiddle: "",
        phoneLast: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);
    const [emailCheckResult, setEmailCheckResult] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 전화번호 중간 및 마지막 자리는 숫자만 입력
        const nextValue =
            name === "phoneMiddle" || name === "phoneLast"
                ? value.replace(/\D/g, "")
                : value;


        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        if(name==="email"){
            setEmailCheckResult(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");


        const {
            email,
            password,
            confirmPassword,
            name,
            phonePrefix,
            phoneMiddle,
            phoneLast,
        } = formData;

        if (formData.password.length < 9) {
            setError("비밀번호는 9자 이상 입력해주세요.");
            return;
        }

        // 비밀번호 확인 검사
        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 전화번호 검사
        if (!/^\d{3,4}$/.test(phoneMiddle)) {
            setError("전화번호 가운데 자리를 3~4자리로 입력해주세요.");
            return;
        }

        if (!/^\d{4}$/.test(phoneLast)) {
            setError("전화번호 마지막 자리를 4자리로 입력해주세요.");
            return;
        }

        // 백엔드에 전달할 전화번호 조합
        const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;

        // 확인용 비밀번호는 제외하고 전송
        const requestData = {
            email,
            password,
            name,
            phone,
        };

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost/api/member/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(
                    message || "회원가입에 실패했습니다."
                );
            }

            alert("회원가입이 완료되었습니다.");
            navigate("/member/login");
        } catch (err) {
            setError(
                err.message || "서버와 통신할 수 없습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const checkEmailDuplicate = async() => {
        const email = formData.email.trim();

        if(!email) {
            setEmailCheckResult({
                type:"error",
                message: "이메일을 입력해주세요.",
            });
            return;
        }
        // 이메일 형식 검사
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailPattern.test(email)) {
            setEmailCheckResult({
                type:"error",
                message: "올바른 이메일 형식을 입력해주세요.",
            });
            return;
        }
        try{
            setEmailCheckLoading(true);
            setEmailCheckResult(null);
            const response = await fetch(
                `http://localhost/api/member/check-email?email=${encodeURIComponent(email)}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`이메일 중복확인 실패 (${response.status})`);
            }

            const data = await response.json();

            // 서버 응답: { "available": true } 또는 { "available": false }
            if (typeof data.available !== "boolean") {
                throw new Error("서버 응답 형식이 올바르지 않습니다.");
            }

            setEmailCheckResult(
                data.available
                    ? {
                        type: "success",
                        message: "사용 가능한 이메일입니다.",
                    }
                    : {
                        type: "error",
                        message: "이미 사용 중인 이메일입니다.",
                    }
            );
        } catch (err) {
            console.error("이메일 중복확인 오류:", err);

            setEmailCheckResult({
                type: "error",
                message: err.message || "중복확인 중 오류가 발생했습니다.",
            });
        } finally {
            setEmailCheckLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* 로고 */}
            <div className="login-logo">
                <Link to="/">HOON HOme</Link>
                <p>HOME & LIVING</p>
            </div>

            {/* 회원가입 카드 */}
            <div className="login-card">
                <div className="login-heading">
                    <span>CREATE ACCOUNT</span>
                    <h1>회원가입</h1>
                    <p>
                        HOON HOme의 회원이 되어보세요.
                        <br />
                        간단한 정보 입력으로 가입할 수 있습니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* 이메일 */}
                    <div className="login-form-group">
                        <label htmlFor="email">이메일</label>

                        <div className="login-email-row">
                            <input
                                className="login-email-input"
                                type="email"
                                id="email"
                                name="email"
                                placeholder="example@email.com"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="email-check-button"
                                onClick={checkEmailDuplicate}
                                disabled={emailCheckLoading}
                            >
                                {emailCheckLoading ? "확인 중..." : "중복확인"}
                            </button>
                        </div>

                        {emailCheckResult && (
                            <p
                                className={`email-check-message ${emailCheckResult.type}`}
                                role="status"
                            >
                                {emailCheckResult.message}
                            </p>
                        )}
                    </div>

                    {/* 비밀번호 */}
                    <div className="login-form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="9자 이상 입력해주세요."
                            autoComplete="new-password"
                            minLength={9}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {formData.password.length > 0 &&
                            formData.password.length < 9 && (
                                <p className="password-match error">
                                    비밀번호는 9자 이상 입력해주세요.
                                    (현재 {formData.password.length}자)
                                </p>
                            )}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="login-form-group">
                        <label htmlFor="confirmPassword">
                            비밀번호 확인
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="비밀번호를 다시 입력하세요."
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        {formData.confirmPassword && (
                            <p
                                className={
                                    formData.password ===
                                    formData.confirmPassword
                                        ? "password-match success"
                                        : "password-match error"
                                }
                            >
                                {formData.password ===
                                formData.confirmPassword
                                    ? "비밀번호가 일치합니다."
                                    : "비밀번호가 일치하지 않습니다."}
                            </p>
                        )}
                    </div>

                    {/* 이름 */}
                    <div className="login-form-group">
                        <label htmlFor="name">이름</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="이름을 입력하세요."
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 전화번호 */}
                    <div className="login-form-group">
                        <label htmlFor="phonePrefix">전화번호</label>

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

                    {/* 가입 버튼 */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "가입 처리 중..." : "회원가입"}
                    </button>
                </form>

                {/* 로그인 페이지 이동 */}
                <div className="login-signup">
                    이미 회원이신가요?
                    <Link to="/member/login">로그인</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
