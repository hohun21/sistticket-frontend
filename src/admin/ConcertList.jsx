import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import "./ConcertList.css"

function ConcertList() {
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchConcerts = async () => {
            try {
                const response = await fetch("" +
                    "http://localhost/api/admin/topconcert", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("공연 목록 조회에 실패했습니다.");
                }

                const data = await response.json();

                // 배열 또는 Page 응답의 content 처리
                const concertList = Array.isArray(data)
                    ? data
                    : data.content ?? [];

                setConcerts(concertList);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "공연 목록 조회 중 오류가 발생했습니다.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchConcerts();

        return () => controller.abort();
    }, []);

    return (
        <article className="admin-panel concert-panel">
            <div className="admin-panel-heading">
                <div>
                    <h3>공연 현황</h3>
                    <p>등록된 공연 목록</p>
                </div>

                <button
                    type="button"
                    className="admin-panel-button"
                    onClick={() => window.location.href = "http://localhost:80/settings/concert"}
                >
                    더 보기
                </button>
            </div>

            <div className="admin-concert-list">
                {loading ? (
                    <p className="concert-message">
                        공연 정보를 불러오는 중...
                    </p>
                ) : error ? (
                    <p className="concert-message error">{error}</p>
                ) : concerts.length === 0 ? (
                    <p className="concert-message">
                        등록된 공연이 없습니다.
                    </p>
                ) : (
                    concerts.slice(0, 3).map((concert) => (
                        <div
                            className="admin-concert-item"
                            key={concert.concertId}
                        >
                            <div className="concert-cover purple">
                                {concert.concertImgPath ? (
                                    <img
                                        src={concert.concertImgPath}
                                        alt={concert.concertName}
                                        className="concert-thumbnail"
                                    />
                                ) : (
                                    <span>♫</span>
                                )}

                                <small>{concert.genreName || "공연"}</small>
                            </div>

                            <div className="concert-info">
                                <strong>{concert.concertName}</strong>
                                <span>{concert.genreName || "장르 미정"}</span>
                            </div>

                            <span className="concert-arrow">›</span>
                        </div>
                    ))
                )}
            </div>

            <div className="admin-panel-footnote">
                최근 등록된 공연 최대 5개를 표시합니다.
            </div>
        </article>
    );
}

export default ConcertList;