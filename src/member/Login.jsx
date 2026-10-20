
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            const response = await fetch("/api/member/login", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                let errorData = {};

                try {
                    errorData = await response.json();
                } catch (e) {
                    console.error("로그인 오류 응답 파싱 실패:", e);
                }

                const message =
                    errorData.message ??
                    "아이디 또는 비밀번호를 확인해 주세요.";

                setErrorMessage(message);



                return;
            }

            const data = await response.json();

            if (data.redirectUrl) {
                // 관리자 React 페이지 또는 일반 회원 Thymeleaf 페이지로 이동
                window.location.href = data.redirectUrl;
            } else if (data.role === "ADMIN") {
                navigate("/admin");
            } else {
                window.location.href = "/";
            }
        } catch (error) {
            console.error("로그인 요청 실패:", error);
            setErrorMessage(
                "서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요."
            );
        }
    };

    return (
        <div className="login-container">
            <header className="login-logo">
                <Link to="/">SistTicket</Link>
                <p>YOUR NEXT STAGE</p>
            </header>

            <main className="login-card">
                <div className="login-heading">
                    <span>WELCOME BACK</span>
                    <h1>로그인</h1>
                    <p>
                        보고 싶었던 무대,
                        <br />
                        지금 만나보세요.
                    </p>
                </div>

                {searchParams.has("error") && !errorMessage && (
                    <div className="login-error">
                        아이디 또는 비밀번호를 확인해 주세요.
                    </div>
                )}

                {searchParams.has("logout") && (
                    <div className="login-logout">
                        로그아웃되었습니다.
                    </div>
                )}

                {errorMessage && (
                    <div className="login-error" role="alert">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email">아이디</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="아이디를 입력하세요"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">
                        로그인
                    </button>
                </form>

                <div className="login-signup">
                    아직 회원이 아니신가요?
                    <Link to="/member/signup">회원가입</Link>
                </div>

                <div className="login-find-links">
                    <Link to="/member/find-id">아이디 찾기</Link>
                    <span>|</span>
                    <Link to="/member/find-password">비밀번호 찾기</Link>
                </div>
            </main>
        </div>
    );
}

export default Login;
