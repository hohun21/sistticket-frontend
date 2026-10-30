# SISTTICKET Frontend

<p align="left">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=222" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white" alt="React Router 7" />
  <img src="https://img.shields.io/badge/HTTP-Axios%20%2B%20Fetch-5A29E4" alt="Axios and Fetch" />
</p>

**SISTTICKET Frontend**는 공연을 탐색하고 회차별 좌석을 선택한 뒤 주문 및 모의 결제 흐름으로 이어질 수 있도록 구성한 React 웹 애플리케이션입니다. 일반 사용자 화면과 관리자 화면을 React Router로 분리했으며, **/api** 요청은 개발 중 Vite 프록시를 통해 Spring Boot 백엔드로 전달합니다.

- **Frontend:** [hohun21/sistticket-frontend](https://github.com/hohun21/sistticket-frontend)
- **Backend:** [hohun21/SistTicket](https://github.com/hohun21/SistTicket)

> 결제 화면은 현재 코드상 성공·실패 시나리오를 처리하는 모의 결제 흐름입니다. 실제 PG사 결제창 연동으로 오해되지 않도록 구분합니다. 관리자 매출 메뉴는 현재 플레이스홀더 화면입니다.

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [화면 및 라우팅](#화면-및-라우팅)
- [프런트엔드 구조](#프런트엔드-구조)
- [백엔드 연동 구조](#백엔드-연동-구조)
- [로컬 실행 방법](#로컬-실행-방법)
- [빌드 및 배포](#빌드-및-배포)
- [시연 화면](#시연-화면)
- [현재 범위 및 개선 과제](#현재-범위-및-개선-과제)

## 주요 기능

### 사용자 화면

- **메인 페이지:** 메인 공연 정보를 보여주는 진입 화면
- **공연 탐색:** 공연 목록과 상세 페이지, 공연 회차 정보 확인
- **좌석 예매:** 공연 회차 선택, 좌석 상태 확인 및 좌석 선점 흐름
- **주문 및 결제:** 주문 생성, 모의 결제 성공·실패 처리, 실패 결제 재시도 흐름
- **회원 기능:** 로그인, 회원가입, 아이디 찾기, 비밀번호 찾기
- **마이페이지:** 내 정보 확인·수정·탈퇴, 리뷰 관련 화면

### 관리자 화면

- **대시보드:** 운영 현황 요약
- **공연 설정:** 공연 정보 관리 화면
- **예매 관리:** 예매 목록과 상세 정보
- **취소 관리:** 취소 요청 목록과 처리 화면
- **회원 관리:** 회원 검색·필터링 및 관리 작업
- **매출 관리:** 메뉴는 연결되어 있으나, 현재는 플레이스홀더 화면

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| UI | React 19 |
| 개발 서버 / 빌드 | Vite 8 |
| 라우팅 | React Router 7 |
| HTTP 통신 | Axios 및 Fetch API |
| 스타일 | CSS, CSS Modules |
| 코드 검사 | Oxlint |
| Backend API | Spring Boot REST API |

## 화면 및 라우팅

현재 **src/App.jsx**에서 확인되는 주요 경로입니다.

| 경로 | 화면 |
|---|---|
| **/** | 메인 페이지 |
| **/concert/list** | 공연 목록 |
| **/concert/:concertId** | 공연 상세 |
| **/seat/select** | 좌석 선택 및 예매 흐름 |
| **/payment/checkout** | 주문·결제 진행 |
| **/payment/result** | 결제 결과 |
| **/mypage** | 마이페이지 |
| **/mypage/myreviews** | 내 리뷰 |
| **/mypage/verify** | 회원 정보 확인 |
| **/mypage/edit** | 회원 정보 수정 |
| **/mypage/withdraw** | 회원 탈퇴 |
| **/member/login** | 로그인 |
| **/member/signup** | 회원가입 |
| **/member/find-id** | 아이디 찾기 |
| **/member/find-password** | 비밀번호 찾기 |
| **/admin** | 관리자 대시보드 |
| **/admin/settings/main** | 공연 설정 |
| **/admin/reservations** | 예매 관리 |
| **/admin/reservations/cancellations** | 취소 관리 |
| **/admin/members** | 회원 관리 |
| **/admin/revenue** | 매출 관리 플레이스홀더 |

## 프런트엔드 구조

~~~text
src/
├── admin/       # 관리자 레이아웃, 대시보드, 예매·회원 관리
├── concert/     # 공연 목록·상세, 리뷰 관련 컴포넌트
├── mainpage/    # 메인 화면
├── member/      # 로그인·회원가입·아이디/비밀번호 찾기
├── pages/
│   └── MyPage/  # 마이페이지, 내 리뷰, 회원 정보 수정·탈퇴
├── payment/     # 결제 진행·결과 화면
├── seat/        # 좌석 선택, API 호출, 예매 흐름 처리
├── assets/      # 이미지 등 정적 자산
└── App.jsx      # React Router 경로 정의
~~~

## 백엔드 연동 구조

~~~mermaid
flowchart LR
    B[Browser] --> R[React Router]
    R --> P[Page / Feature Components]
    P --> API[Axios / Fetch]
    API -->|/api/*| V[Vite Dev Proxy]
    V --> S[Spring Boot REST API]
    S --> DB[(MySQL)]
~~~

현재 **vite.config.js**의 개발 서버 설정은 다음과 같습니다.

- 프런트엔드 개발 주소: **http://localhost:5173**
- **/api** 요청 프록시 대상: **http://localhost:80**
- 좌석 API 요청 코드는 **credentials: "include"**를 사용해 세션 쿠키를 포함합니다.

백엔드 포트가 **80**이 아니라면 **vite.config.js**의 **server.proxy["/api"].target** 값을 실제 백엔드 포트에 맞춰 변경해야 합니다. 배포 환경에서는 개발용 Vite 프록시에 의존하지 말고, 웹 서버의 API 프록시 또는 실제 API 주소와 인증 쿠키 정책을 별도로 설정해야 합니다.

### 예매 흐름

1. 사용자가 공연과 회차를 선택합니다.
2. 좌석 화면에서 좌석 상태를 조회하고 좌석 선점을 요청합니다.
3. 선점 토큰 및 선택 좌석 정보를 바탕으로 주문을 생성합니다.
4. 결제 화면에서 모의 성공 또는 실패 시나리오를 진행합니다.
5. 백엔드 응답에 따라 결과 화면으로 이동합니다.

좌석 선점·주문 상태는 클라이언트 UI만으로 확정하지 않고 백엔드 API의 결과를 기준으로 처리하도록 구성되어 있습니다.

## 로컬 실행 방법

### 사전 준비

- Node.js 및 npm
- 실행 중인 [SISTTICKET Backend](https://github.com/hohun21/SistTicket)

### 설치 및 개발 서버 실행

~~~bash
git clone https://github.com/hohun21/sistticket-frontend.git
cd sistticket-frontend
npm install
npm run dev
~~~

브라우저에서 **http://localhost:5173**을 엽니다. 로그인, 공연·좌석·주문 기능을 확인하려면 백엔드와 DB가 정상 실행 중이어야 합니다.

### 사용 가능한 스크립트

| 명령어 | 설명 |
|---|---|
| **npm run dev** | Vite 개발 서버 실행 |
| **npm run build** | 프로덕션 빌드 생성 |
| **npm run preview** | 빌드 결과 로컬 미리보기 |
| **npm run lint** | Oxlint 코드 검사 |

## 빌드 및 배포

~~~bash
npm run lint
npm run build
npm run preview
~~~

프로덕션 정적 파일은 **dist/**에 생성됩니다. 이를 정적 호스팅 또는 웹 서버에 배포하고, **/api** 요청이 백엔드로 전달되도록 서버 측 프록시와 인증 쿠키 설정을 구성하세요.

현재 저장소에서 프런트엔드 배포용 CI/CD 워크플로는 확인되지 않았습니다. 위 절차는 수동 빌드와 결과물 확인 방법입니다.

## 시연 화면

실제 브라우저 캡처를 **docs/screenshots/**에 저장한 뒤 아래 이미지 경로를 활성화하면 됩니다.

<!--
![메인 페이지](docs/screenshots/main-page.png)
![공연 목록 및 상세](docs/screenshots/concert-list-detail.png)
![좌석 선택](docs/screenshots/seat-selection.png)
![주문 및 모의 결제](docs/screenshots/payment-flow.png)
![관리자 화면](docs/screenshots/admin-dashboard.png)
-->

추천 시연 흐름: **공연 목록 → 공연 상세 → 좌석 선점 → 주문·모의 결제 → 관리자 예매 관리**

## 현재 범위 및 개선 과제

- 실제 PG사 결제 SDK 연동과 결제 승인·취소 검증
- API 오류 및 세션 만료 상황에 대한 사용자 피드백 일관화
- 로딩·빈 상태·실패 상태의 UI 일관성 개선
- 매출 관리 화면과 실제 집계 API 연결
- 환경별 API URL 설정 및 운영 배포 구성 문서화

---

**Backend repository:** [hohun21/SistTicket](https://github.com/hohun21/SistTicket)
