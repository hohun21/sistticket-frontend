// 좌석 화면에서 사용하는 서버 요청을 모아 둔 파일

export class SeatApiError extends Error {
  constructor(message, status = 0, uncertain = false) {
    super(message);
    this.name = "SeatApiError";
    this.status = status;

    // 서버에서 처리됐지만 응답만 받지 못했을 가능성
    this.uncertain = uncertain;
  }
}

async function request(url, options = {}) {
  const {
    method = "GET",
    body,
    signal,
  } = options;

  const isMutation = method !== "GET";

  let response;

  try {
    response = await fetch(
      new URL(url, "http://localhost").toString(),
      {
        method,
        signal,
        credentials: "include",

        headers: {
          Accept: "application/json",
          ...(body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        },

        ...(body !== undefined
          ? { body: JSON.stringify(body) }
          : {}),
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new SeatApiError(
      isMutation
        ? "처리 결과를 확인하지 못했습니다. 좌석이나 주문 상태를 확인해 주세요."
        : "서버에 연결하지 못했습니다.",
      0,
      isMutation
    );
  }

  // 현재 Spring Security는 로그인이 필요하면
  // JSON 대신 로그인 화면으로 이동시킬 수 있음
  if (response.redirected) {
    throw new SeatApiError(
      "로그인 상태를 확인한 뒤 다시 이용해 주세요.",
      response.status,
      isMutation
    );
  }

  if (response.status === 401) {
    throw new SeatApiError(
      "로그인 후 이용해 주세요.",
      401
    );
  }

  // 선점 취소 성공: 응답 본문 없음
  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("json")) {
    try {
      data = await response.json();
    } catch {
      throw new SeatApiError(
        "서버 응답을 확인하지 못했습니다.",
        response.status,
        isMutation
      );
    }
  }

  if (!response.ok) {
    const fallbackMessages = {
      400: "요청한 정보를 확인해 주세요.",
      403: "해당 요청을 처리할 권한이 없습니다.",
      404: "요청한 정보를 찾을 수 없습니다.",
      409: "좌석 상태가 변경되었습니다. 다시 확인해 주세요.",
    };

    // 서버 내부 오류 메시지는 그대로 화면에 표시하지 않음
    const message =
      response.status >= 500
        ? "서버에서 처리 결과를 확인하지 못했습니다."
        : data?.detail ||
          data?.message ||
          fallbackMessages[response.status] ||
          "요청을 처리하지 못했습니다.";

    throw new SeatApiError(
      message,
      response.status,
      isMutation && response.status >= 500
    );
  }

  if (data === null) {
    throw new SeatApiError(
      "서버 응답 형식이 올바르지 않습니다.",
      response.status,
      isMutation
    );
  }

  return data;
}

function performanceUrl(performanceId) {
  return `/api/performances/${encodeURIComponent(performanceId)}`;
}

// 1. 선택한 회차의 공연 정보
export function getPerformanceInfo(performanceId, signal) {
  return request(
    `${performanceUrl(performanceId)}/seat-info`,
    { signal }
  );
}

// 2. 같은 공연의 전체 회차 목록
export function getSchedules(performanceId, signal) {
  return request(
    `${performanceUrl(performanceId)}/seat-schedules`,
    { signal }
  );
}

// 3. 선택한 회차의 좌석 목록
export function getSeats(performanceId, signal) {
  return request(
    `${performanceUrl(performanceId)}/seats`,
    { signal }
  );
}

// 4. 좌석 임시 선점
export function holdSeats(performanceId, performanceSeatIds) {
  return request(
    `${performanceUrl(performanceId)}/holds`,
    {
      method: "POST",
      body: { performanceSeatIds },
    }
  );
}

// 5. 기존 선점 해제
// 별도 취소 버튼 대신, 회차나 좌석을 변경할 때 내부적으로 사용
export function cancelHold(performanceId, holdToken) {
  return request(
    `${performanceUrl(performanceId)}/holds/cancel`,
    {
      method: "POST",
      body: { holdToken },
    }
  );
}

// 6. 선점한 좌석으로 주문 생성
export function createOrder({
  performanceId,
  performanceSeatIds,
  holdToken,
  paymentMethod,
}) {
  if (!paymentMethod?.trim()) {
    throw new SeatApiError(
      "결제 수단을 선택해 주세요.",
      400
    );
  }

  return request("/api/orders", {
    method: "POST",
    body: {
      performanceId,
      performanceSeatIds,
      holdToken,
      paymentMethod,
    },
  });
}

/* 7. 결제 성공 처리 - 발표용 모의 결제 */
export function completePayment(paymentId) {
  return request(
    `/api/payments/${encodeURIComponent(paymentId)}/complete`,
    {
      method: "POST",
      body: {
        paymentKey: `DEMO-${paymentId}-${Date.now()}`,
      },
    }
  );
}

/* 8. 결제 실패 처리 - 발표용 시나리오 */
export function failPayment(paymentId) {
  return request(
    `/api/payments/${encodeURIComponent(paymentId)}/fail`,
    {
      method: "POST",
    }
  );
}

/* 9. 실패한 결제 재시도 */
export function retryPayment(paymentId) {
  return request(
    `/api/payments/${encodeURIComponent(paymentId)}/retry`,
    {
      method: "POST",
    }
  );
}
