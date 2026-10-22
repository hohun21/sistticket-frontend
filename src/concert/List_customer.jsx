import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./List_customer.module.css";

const API_BASE = "http://localhost";

function imageUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value, API_BASE);

    return ["http:", "https:"].includes(url.protocol)
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function dateLabel(value) {
  return value ? String(value).slice(0, 10).replaceAll("-", ".") : "미정";
}

function statusLabel(status) {
  switch (status) {
    case "UPCOMING":
      return "공연 예정";
    case "ONGOING":
      return "공연 중";
    case "FINISHED":
      return "공연 종료";
    case "ISCANCELED":
      return "공연 취소";
    default:
      return "";
  }
}

async function getJson(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    signal,
  });

  if (
    !response.ok ||
    response.redirected ||
    !(response.headers.get("content-type") || "").includes("json")
  ) {
    throw new Error("공연 정보를 불러오지 못했습니다.");
  }

  return response.json();
}

function ConcertCard({ concert }) {
  const [imageFailed, setImageFailed] = useState(false);
  const poster = imageUrl(concert.imgUrl);

  const reviewCount = Number(concert.reviewCount) || 0;
  const rating = Number(concert.ratingAvg);

  return (
    <Link
      to={`/concert/${concert.concertId}`}
      className={styles.card}
    >
      <div className={styles.posterBox}>
        {poster && !imageFailed ? (
          <img
            src={poster}
            alt={`${concert.concertName} 포스터`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={styles.posterFallback}>SIST TICKET</div>
        )}

        {statusLabel(concert.status) && (
          <span className={styles.status}>
            {statusLabel(concert.status)}
          </span>
        )}
      </div>

      <div className={styles.cardBody}>
        <span className={styles.genre}>
          {concert.genreName || "공연"}
        </span>

        <h2>{concert.concertName}</h2>

        <p className={styles.venue}>
          {concert.venueName || "공연장 미정"}
        </p>

        <p className={styles.period}>
          {dateLabel(concert.startDate)} ~ {dateLabel(concert.endDate)}
        </p>

        <div className={styles.cardFooter}>
          {reviewCount > 0 && Number.isFinite(rating) ? (
            <span className={styles.rating}>
              <span aria-hidden="true">★</span>{" "}
              {rating.toFixed(1)}
              <small>리뷰 {reviewCount.toLocaleString()}개</small>
            </span>
          ) : (
            <span className={styles.noReview}>등록된 리뷰가 없습니다.</span>
          )}

          <span className={styles.detailLink}>상세보기 →</span>
        </div>
      </div>
    </Link>
  );
}

export default function List_customer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = Number(searchParams.get("page") || 0);
  const page =
    Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const rawGenreId = searchParams.get("genreId") || "";
  const genreId = /^\d+$/.test(rawGenreId) ? rawGenreId : "";

  const rawType = searchParams.get("type") || "nv";
  const type = ["nv", "n", "v"].includes(rawType) ? rawType : "nv";
  const keyword = searchParams.get("searchKeyword") || "";

  const [genres, setGenres] = useState([]);
  const [genreError, setGenreError] = useState("");
  const [result, setResult] = useState({
    content: [],
    number: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getJson("/api/concert/genres", controller.signal)
      .then((data) => {
        setGenres(data);
        setGenreError("");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setGenreError("장르 목록을 불러오지 못했습니다.");
        }
      });

    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConcerts() {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        page: String(page),
        size: "9",
        type,
      });

      if (genreId) query.set("genreId", genreId);
      if (keyword) query.set("searchKeyword", keyword);

      try {
        const data = await getJson(
          `/api/concert?${query.toString()}`,
          controller.signal
        );

        if (!Array.isArray(data.content)) {
          throw new Error("공연 목록 응답 형식을 확인해 주세요.");
        }

        setResult(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadConcerts();

    return () => controller.abort();
  }, [page, genreId, type, keyword, reload]);

  function changeGenre(nextGenreId) {
    const next = new URLSearchParams(searchParams);

    next.set("page", "0");

    if (nextGenreId) {
      next.set("genreId", String(nextGenreId));
    } else {
      next.delete("genreId");
    }

    setSearchParams(next);
  }

  function search(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();

    next.set("page", "0");
    next.set("type", String(form.get("type") || "nv"));

    const nextKeyword = String(form.get("searchKeyword") || "").trim();

    if (nextKeyword) next.set("searchKeyword", nextKeyword);
    if (genreId) next.set("genreId", genreId);

    setSearchParams(next);
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  }

  const currentGenre = genres.find(
    (genre) => String(genre.genreId) === genreId
  );

  const totalPages = Number(result.totalPages) || 0;
  const currentPage = Number(result.number) || 0;

  const firstPage = Math.max(
    0,
    Math.min(currentPage - 2, totalPages - 5)
  );

  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPage + index
  );

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/concert/list" className={styles.brand}>
            SIST TICKET
          </Link>

          <div className={styles.heading}>
            <span>CONCERT &amp; MUSICAL</span>
            <h1>어떤 무대를 만나볼까요?</h1>
          </div>

          <form
            key={`${type}-${keyword}`}
            className={styles.searchForm}
            onSubmit={search}
            role="search"
          >
            <label className={styles.srOnly} htmlFor="concert-search-type">
              검색 기준
            </label>

            <select
              id="concert-search-type"
              name="type"
              defaultValue={type}
            >
              <option value="nv">공연명 + 공연장</option>
              <option value="n">공연명</option>
              <option value="v">공연장</option>
            </select>

            <label className={styles.srOnly} htmlFor="concert-search-keyword">
              검색어
            </label>

            <input
              id="concert-search-keyword"
              name="searchKeyword"
              defaultValue={keyword}
              placeholder="공연명 또는 공연장을 검색해 주세요."
              maxLength={100}
            />

            <button type="submit" className={styles.searchButton}>
              검색
            </button>

            <button
              type="button"
              className={styles.resetButton}
              onClick={() => setSearchParams({})}
            >
              초기화
            </button>
          </form>
        </div>
      </header>

      <main className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2>장르</h2>

          <nav className={styles.genreNav} aria-label="공연 장르">
            <button
              type="button"
              className={!genreId ? styles.activeGenre : ""}
              aria-pressed={!genreId}
              onClick={() => changeGenre("")}
            >
              전체보기
            </button>

            {genres.map((genre) => {
              const selected = String(genre.genreId) === genreId;

              return (
                <button
                  key={genre.genreId}
                  type="button"
                  className={selected ? styles.activeGenre : ""}
                  aria-pressed={selected}
                  onClick={() => changeGenre(genre.genreId)}
                >
                  {genre.genreName}
                </button>
              );
            })}
          </nav>

          {genreError && (
            <p className={styles.genreError}>{genreError}</p>
          )}
        </aside>

        <section className={styles.results} aria-busy={loading}>
          <div className={styles.resultHeader}>
            <div>
              <h2>{currentGenre?.genreName || "전체 공연"}</h2>

              {keyword && (
                <p className={styles.searchDescription}>
                  “{keyword}” 검색 결과
                </p>
              )}
            </div>

            {!loading && !error && (
              <span>
                총 <strong>{Number(result.totalElements).toLocaleString()}</strong>개
              </span>
            )}
          </div>

          {loading ? (
            <div className={styles.notice} role="status">
              공연 목록을 불러오는 중입니다.
            </div>
          ) : error ? (
            <div className={styles.notice} role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setReload((value) => value + 1)}
              >
                다시 불러오기
              </button>
            </div>
          ) : result.content.length === 0 ? (
            <div className={styles.notice}>
              <p>조건에 맞는 공연이 없습니다.</p>
              <button type="button" onClick={() => setSearchParams({})}>
                전체 공연 보기
              </button>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {result.content.map((concert) => (
                  <ConcertCard
                    key={`${concert.concertId}-${concert.imgUrl || ""}`}
                    concert={concert}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="목록 페이지">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => changePage(currentPage - 1)}
                  >
                    이전
                  </button>

                  {pages.map((number) => (
                    <button
                      key={number}
                      type="button"
                      className={
                        number === currentPage ? styles.currentPage : ""
                      }
                      aria-current={
                        number === currentPage ? "page" : undefined
                      }
                      onClick={() => changePage(number)}
                    >
                      {number + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => changePage(currentPage + 1)}
                  >
                    다음
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}