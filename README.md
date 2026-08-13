# Wordy Backend

> **업무 기록을 AI 기반 성과 데이터로 전환하고, 일지와 주간·월간 대시보드를 통해 업무 성장 흐름을 관리하는 Wordy의 Backend API Server입니다.**

Wordy는 사용자가 매일 기록한 업무와 업무 결과를 기반으로 회고를 작성하고,
AI가 이를 구조화된 성과 데이터로 변환하여 주간·월간 단위로 확인할 수 있도록 지원합니다.

---

## 🔗 Service Links

| 구분 | 링크 |
|---|---|
| 🌐 Web Service | https://wordy-site.vercel.app/ |
| ⚙️ API Server | https://wordy-be.p-e.kr/ |
| 📚 Swagger API Docs | https://wordy-be.p-e.kr/api-docs |
| 🗄️ ERD | https://www.erdcloud.com/d/a2BohuKYasrsPHg2e |
| 💻 GitHub Repository | https://github.com/UMC-10th-Wordy/Wordy_BE |

---

## ✨ 주요 기능

### ✅ 업무 관리
- 날짜별 업무카드 생성 / 조회 / 수정 / 삭제
- `Must do / Should do / Could do` 기반 우선순위 관리
- Drag & Drop 기반 업무 순서 변경
- 업무 완료 상태 관리
- 완료 업무의 업무 결과 및 첨부파일 기록

### 🏷️ 프로젝트 태그
- 업무별 프로젝트 태그 관리
- 프로젝트 목적 및 기대 성과 설정
- 예상 프로젝트 기간 관리
- KPI 설정을 통한 프로젝트 성과 추적

### 📝 업무 일지
- 날짜별 업무 및 회고 저장
- 월별 업무 일지 조회
- 업무 및 프로젝트 태그 기반 검색
- 일지 삭제 및 휴지통 복구

### 🤖 AI 성과 변환
- 완료 업무 및 업무 결과를 기반으로 성과 분석
- 변환 시점의 업무 데이터를 Snapshot으로 보존
- 업무 변경 이후에도 변환 당시 성과 데이터 유지
- AI 기반 성과 Summary / Growth Insight / Next Action 생성

### 📊 성과 대시보드
- 주간 / 월간 성과 대시보드 제공
- 업무 완료율 및 성과 데이터 집계
- KPI 기반 성과 분석
- 프로젝트 태그 기반 업무 흐름 분석
- AI 기반 주간·월간 인사이트 제공

### 👤 사용자 및 인증
- 이메일 인증 기반 회원가입
- JWT 기반 인증
- Google OAuth 2.0 로그인
- 사용자 프로필 관리
- Workspace 기반 데이터 관리
- 알림 기능

---

## 🏗️ Backend Architecture

```text
사용자
  │
  │ HTTPS
  ▼
Nginx
(SSL / Reverse Proxy)
  │
  │ :3000
  ▼
Node.js API Server
├── Express + TypeScript
├── TSOA / Swagger
├── Prisma ORM
└── PM2
     │
     ├── MySQL
     ├── Google Cloud Storage
     ├── Google OAuth 2.0
     └── OpenAI API
```

### Infrastructure

- **Google Cloud Compute Engine** — Backend Application Server
- **Nginx** — Reverse Proxy / HTTPS
- **PM2** — Node.js Process Manager
- **MySQL** — Application Database
- **Google Cloud Storage** — Profile Image / Attachment Storage
- **GitHub Actions** — CI / CD
- **Google OAuth 2.0** — Social Login
- **OpenAI API** — AI 성과 분석

---

## 🔄 CI / CD

### CI

`dev`, `main` 대상 Pull Request와 `dev` 브랜치 변경사항에 대해
GitHub Actions에서 다음 과정을 검증합니다.

```text
npm ci
→ prisma generate
→ tsoa spec-and-routes
→ TypeScript Build
```

CI 과정에서 실제 운영 DB에 접속하지 않고 Prisma Client 생성 및 TypeScript Build 가능 여부를 검증합니다.

### Production Deployment

검증된 `main` 브랜치의 코드를 GitHub Actions의 수동 배포 Workflow를 통해 운영 서버에 반영합니다.

```text
GitHub main
→ GitHub Actions
→ SSH Deploy
→ origin/main 동기화
→ npm ci
→ prisma generate
→ build
→ prisma migrate deploy
→ PM2 restart
→ Health Check
```

배포 완료 후 운영 서버 `https://wordy-be.p-e.kr/`에 대한 Health Check를 수행합니다.

---

## ⚙️ Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js 22.23.1 |
| Language | TypeScript 6.0.3 |
| Server | Express 5.2.1 |
| ORM | Prisma 7.9.0 |
| Database | MySQL |
| API Specification | TSOA |
| API Documentation | Swagger UI |
| Authentication | JWT / Google OAuth 2.0 |
| AI | OpenAI SDK |
| File Storage | Google Cloud Storage |
| Infrastructure | Google Cloud Compute Engine |
| Web Server | Nginx |
| Process Manager | PM2 |
| CI / CD | GitHub Actions |
| Code Quality | ESLint / Prettier |

---

## 📁 Project Structure

```text
.
├── prisma
│   ├── migrations
│   └── schema.prisma
│
├── src
│   ├── common
│   ├── modules
│   │   ├── ai
│   │   ├── auth
│   │   ├── dailyPerformance
│   │   ├── dailyentries
│   │   ├── dashboard.month
│   │   ├── dashboard.week
│   │   ├── home
│   │   ├── notifications
│   │   ├── tags
│   │   ├── task-results
│   │   ├── tasks
│   │   ├── trash
│   │   ├── users
│   │   └── workspace
│   │
│   ├── auth.config.ts
│   ├── db.config.ts
│   └── index.ts
│
├── .github
│   └── workflows
│       ├── ci.yml
│       └── cd.yml
│
├── .env.example
├── package.json
├── prisma.config.ts
├── tsoa.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Requirements

- Node.js 22
- npm
- MySQL

### 1. Repository Clone

```bash
git clone https://github.com/UMC-10th-Wordy/Wordy_BE.git
cd Wordy_BE
```

### 2. Install Dependencies

```bash
npm ci
```

`package-lock.json`을 기준으로 동일한 dependency 환경을 구성합니다.

### 3. Environment Variables

`.env.example`을 참고하여 프로젝트 루트에 `.env` 파일을 생성합니다.

> 실제 Secret 및 인증 정보는 Git Repository에 Commit하지 않습니다.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

또는:

```bash
npm run prisma:generate
```

### 5. Apply Migration

기존 Migration을 로컬 DB에 적용합니다.

```bash
npx prisma migrate deploy
```

Schema 변경을 포함한 개발용 Migration은 다음 명령을 사용합니다.

```bash
npm run prisma:migrate
```

### 6. Development Server

```bash
npm run dev
```

개발 서버 실행 시 TSOA Spec / Route 생성 후 서버가 실행됩니다.

기본 포트:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api-docs
```

### 7. Build

```bash
npm run build
```

### 8. Production Start

```bash
npm run start
```

---

## 📦 npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | TSOA Spec / Route 생성 후 개발 서버 실행 |
| `npm run build` | TSOA Spec / Route 생성 후 TypeScript Build |
| `npm run start` | 빌드된 Node.js 서버 실행 |
| `npm run prisma:generate` | Prisma Client 생성 |
| `npm run prisma:migrate` | 개발용 Prisma Migration 실행 |

---

## 🌿 Development Workflow

```text
Issue 생성
→ 최신 dev 반영
→ feature / fix / refactor / docs 브랜치 생성
→ 구현
→ 로컬 검증
→ Pull Request
→ Code Review
→ GitHub Actions CI
→ Merge
```

### Branch

| Branch | Purpose |
|---|---|
| `main` | Production |
| `dev` | Development Integration |
| `feature/*` | Feature Development |
| `fix/*` | Bug Fix |
| `refactor/*` | Refactoring |
| `docs/*` | Documentation |

- 작업은 `dev`에서 직접 진행하지 않고 목적에 맞는 브랜치에서 진행합니다.
- PR은 리뷰와 CI 확인 후 Merge합니다.
- 운영 배포가 필요한 변경사항은 `dev → main` Release PR을 통해 반영합니다.

---

## 🔐 Security

- `.env` 및 서비스 인증 정보는 Repository에 Commit하지 않습니다.
- 운영 서버 SSH Private Key와 배포 관련 정보는 GitHub Secrets로 관리합니다.
- JWT 기반 API 인증을 적용합니다.
- Google OAuth 2.0을 통한 소셜 로그인을 지원합니다.
- 첨부파일과 프로필 이미지는 Google Cloud Storage에 저장합니다.
- 운영 DB에서는 `prisma migrate reset`을 사용하지 않고 `prisma migrate deploy`를 사용합니다.

---

## 📌 API Documentation

전체 API 명세와 Request / Response Schema는 운영 Swagger에서 확인할 수 있습니다.

**Swagger:** https://wordy-be.p-e.kr/api-docs
