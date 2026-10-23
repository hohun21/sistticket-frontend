import { useEffect, useState } from "react";
import styles from "./Detail.module.css";

const API_BASE = "http://localhost";

function safeImageUrl(value) {
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

function ReviewImage({ value }) {
  const [failed, setFailed] = useState(false);
  const src = safeImageUrl(value);

  if (!src || failed) return null;

  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
      <img
        className={styles.reviewImage}
        src={src}
        alt="관람 리뷰 첨부 이미지"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </a>
  );
}

function ratingValue(value) {
  if (value == null || value === "") return null;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 && number <= 5
    ? number
    : null;
}

export default function ConcertVenueReviews({ concert }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");

  const concertId = concert.concertId;
  const venueName = concert.venueName || "";
  const address = concert.venueAddress || "";
  const locationQuery = [address, venueName].filter(Boolean).join(" ");

  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY;

  const mapSrc =
    mapKey && locationQuery
      ? `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({
          key: mapKey,
          q: locationQuery,
          zoom: "15",
          language: "ko",
          region: "KR",
        }).toString()}`
      : "";

  const externalMapUrl =
    `https://www.google.com/maps/search/?api=1&query=` +
    encodeURIComponent(locationQuery);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      setLoading(true);
      setError("");
      setReviews([]);

      try {
        const response = await fetch(
          `${API_BASE}/api/reviews/concert/${encodeURIComponent(concertId)}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (
          !response.ok ||
          response.redirected ||
          !(response.headers.get("content-type") || "").includes("json")
        ) {
          throw new Error("리뷰를 불러오지 못했습니다.");
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : data.reviews;

        if (!Array.isArray(items)) {
          throw new Error("리뷰 응답 형식을 확인해 주세요.");
        }

        setReviews(
          [...items].sort((a, b) =>
            String(b.createdAt || "").localeCompare(
              String(a.createdAt || "")
            )
          )
        );
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

    loadReviews();

    return () => controller.abort();
  }, [concertId, reload]);

  const ratings = reviews
    .map((review) => ratingValue(review.rating))
    .filter((rating) => rating !== null);

  const average = ratings.length
    ? (
        ratings.reduce((sum, rating) => sum + rating, 0) /
        ratings.length
      ).toFixed(1)
    : null;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopyMessage("주소를 복사했습니다.");
    } catch {
      setCopyMessage("주소를 복사하지 못했습니다. 주소를 직접 복사해 주세요.");
    }
  }

  return (
    <>
      <section id="concert-venue" className={styles.section}>
        <h2>장소</h2>
        <strong>{venueName || "공연장 미정"}</strong>

        {mapSrc ? (
          <iframe
            className={styles.venueMap}
            title={`${venueName || "공연장"} 위치 지도`}
            src={mapSrc}
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <p className={styles.mapNotice}>
            {!locationQuery
              ? "등록된 공연장 위치가 없습니다."
              : "지도 API 키를 설정하면 공연장 지도가 표시됩니다."}
          </p>
        )}

        <div className={styles.addressRow}>
          <p>{address || "주소 정보를 확인 중입니다."}</p>

          <div className={styles.addressActions}>
            {address && (
              <button type="button" onClick={copyAddress}>
                주소 복사
              </button>
            )}

            {locationQuery && (
              <a
                href={externalMapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 지도에서 보기 ↗
              </a>
            )}
          </div>
        </div>

        <p className={styles.copyMessage} role="status">
          {copyMessage}
        </p>
      </section>

      <section id="concert-reviews" className={styles.section}>
        <div className={styles.reviewHeader}>
          <h2>
            <span className={styles.reviewStar}>★</span>{" "}
            {loading || error
              ? "관람 리뷰"
              : `${average ? `${average} · ` : ""}리뷰 (${reviews.length})`}
          </h2>
        </div>

        {loading ? (
          <p className={styles.muted} role="status">
            리뷰를 불러오는 중입니다.
          </p>
        ) : error ? (
          <div className={styles.reviewError} role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
            >
              다시 불러오기
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className={styles.muted}>
            아직 작성된 리뷰가 없습니다.
          </p>
        ) : (
          <div className={styles.reviewGrid}>
            {reviews.map((review) => {
              const rating = ratingValue(review.rating);
              const filledStars =
                rating === null ? 0 : Math.round(rating);

              return (
                <article
                  key={review.reviewId}
                  className={styles.reviewCard}
                >
                  <div className={styles.reviewMeta}>
                    {rating !== null && (
                      <span
                        className={styles.reviewStars}
                        aria-label={`5점 만점에 ${rating}점`}
                      >
                        {"★".repeat(filledStars)}
                        {"☆".repeat(5 - filledStars)}
                        <b>{rating}</b>
                      </span>
                    )}

                    <strong>{review.memberName || "익명"}</strong>
                  </div>

                  <p className={styles.reviewText}>{review.text}</p>

                  <ReviewImage
                    key={review.imgUrl || "no-image"}
                    value={review.imgUrl}
                  />

                  {review.createdAt && (
                    <time
                      className={styles.reviewDate}
                      dateTime={review.createdAt}
                    >
                      {String(review.createdAt).slice(0, 10)}
                    </time>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}