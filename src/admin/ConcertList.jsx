import { concertExamples } from "./adminData";

function ConcertList() {
    return (
        <article className="admin-panel concert-panel">
            <div className="admin-panel-heading">
                <div>
                    <h3>공연 현황</h3>
                    <p>등록 공연 예시</p>
                </div>
                <span className="concert-count">{concertExamples.length}</span>
            </div>

            <div className="admin-concert-list">
                {concertExamples.map((concert) => (
                    <div className="admin-concert-item" key={concert.title}>
                        <div className={`concert-cover ${concert.color}`}>
                            <span>♫</span>
                            <small>{concert.category}</small>
                        </div>

                        <div className="concert-info">
                            <strong>{concert.title}</strong>
                            <span>{concert.location}</span>
                            <small>{concert.period}</small>
                        </div>

                        <span className="concert-arrow">›</span>
                    </div>
                ))}
            </div>

            <div className="admin-panel-footnote">
                * 공연 정보는 화면 구성용 샘플입니다.
            </div>
        </article>
    );
}

export default ConcertList;
