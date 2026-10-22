import { cancelHold } from "./seatApi";

const KEY = "sistticket.pendingHold";

export function rememberHold(booking) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      performanceId: booking.performanceId,
      performanceSeatIds: booking.performanceSeatIds,
      holdToken: booking.holdToken,
      holdExpiresAt: booking.holdExpiresAt,
    })
  );
}

function readPendingHold() {
  try {
    const booking = JSON.parse(sessionStorage.getItem(KEY));

    return booking?.performanceId &&
      typeof booking?.holdToken === "string" &&
      booking.holdToken.trim()
      ? booking
      : null;
  } catch {
    return null;
  }
}

export function forgetHold(holdToken) {
  const saved = readPendingHold();

  // 이전 요청이 새 선점 정보를 지우지 않도록 토큰 비교
  if (saved?.holdToken === holdToken) {
    sessionStorage.removeItem(KEY);
  }
}

export async function releasePendingHold() {
  const booking = readPendingHold();

  if (!booking) return true;

  try {
    await cancelHold(
      booking.performanceId,
      booking.holdToken
    );
  } catch (error) {
    if (error.status !== 409) {
      // 로그인 만료·통신 실패라면 토큰을 남겨 재시도
      throw error;
    }

    // 서버가 주문 연결 또는 상태 변경으로 해제를 거절함.
    // 해당 좌석은 서버의 주문·결제 흐름에서 관리한다.
    forgetHold(booking.holdToken);
    return false;
  }

  forgetHold(booking.holdToken);
  return true;
}

export function seatPath(performanceId) {
  const id = Number(performanceId);

  return Number.isSafeInteger(id) && id > 0
    ? `/seat/select?performanceId=${id}`
    : "/seat/select";
}

export function loginPath(performanceId) {
  return (
    "/member/login?returnTo=" +
    encodeURIComponent(seatPath(performanceId))
  );
}