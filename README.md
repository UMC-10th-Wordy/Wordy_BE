# Wordy Backend

Wordy 백엔드 리포지토리입니다.

업무 기록을 기반으로 AI가 성과를 구조화하고, 일지 및 성과 데이터를 대시보드로 제공하는 서비스입니다.

---

## ⚙️ 기술 스택

| 구분 | 기술 / 버전 |
|---|---|
| Runtime | Node.js 22.19.0 |
| Package Manager | npm 10.9.3 |
| Language | TypeScript 6.0.3 |
| Server | Express 5.2.1 |
| ORM | Prisma 7.9.0 |
| Prisma Client | `@prisma/client` 7.9.0 |
| Database | MySQL |
| API Spec | TSOA 7.0.0-alpha.0 |
| API Docs | Swagger UI |
| Authentication | JWT, Google Auth |
| AI | OpenAI SDK |
| File Storage | Google Cloud Storage |
| Code Quality | ESLint, Prettier |

> [!IMPORTANT]
> Prisma CLI와 `@prisma/client`의 버전이 다르면 생성되는 Prisma Client 타입이 달라져
> 로컬 환경마다 TypeScript 오류 발생 여부가 달라질 수 있습니다.
> 의존성 설치 후 반드시 Prisma 버전을 확인하고 `prisma generate`를 실행해 주세요.

---

## 📁 주요 프로젝트 구조

```text
.
├── prisma
│   ├── migrations
│   └── schema.prisma
│
├── src
│   ├── modules
│   │   ├── auth
│   │   ├── users
│   │   ├── profiles
│   │   ├── tags
│   │   ├── tasks
│   │   ├── dailyentries
│   │   ├── dailyPerformance
│   │   ├── ai
│   │   └── dashboard
│   │
│   ├── common
│   ├── config
│   └── index.ts
│
├── package.json
├── prisma.config.ts
├── tsoa.json
├── tsconfig.json
└── README.md
```

> 위 구조는 주요 디렉터리만 표시한 것으로, 실제 파일 구성은 각 모듈에 따라 다를 수 있습니다.

---

## 🚀 로컬 실행 방법

### 1. 의존성 설치

```bash
npm install
```

팀원 간 동일한 의존성 구성을 위해 `package-lock.json`을 함께 관리합니다.

### 2. 환경 변수 설정

프로젝트 실행에 필요한 환경 변수를 `.env`에 설정합니다.

> `.env`의 실제 값은 Git에 커밋하지 않습니다.  
> 필요한 환경 변수 값은 팀에서 공유된 개발 환경 설정을 사용합니다.

### 3. Prisma Client 생성

```bash
npx prisma generate
```

또는:

```bash
npm run prisma:generate
```

### 4. 기존 Migration 적용

이미 생성되어 Git에 반영된 Migration을 로컬 DB에 적용할 때:

```bash
npx prisma migrate deploy
```

### 5. 개발 서버 실행

```bash
npm run dev
```

`npm run dev` 실행 시 TSOA spec/routes 생성 후 개발 서버가 실행됩니다.

### 6. TypeScript 타입 검사

PR 생성 전 아래 명령으로 컴파일 오류가 없는지 확인합니다.

```bash
npx tsc --noEmit
```

### 7. 빌드

```bash
npm run build
```

### 8. 프로덕션 실행

```bash
npm run start
```

---

## 🔍 개발 환경 확인

문제가 발생했을 때 아래 명령으로 주요 버전을 먼저 확인합니다.

### Node.js / npm

```bash
node -v
npm -v
```

### Prisma

```bash
npx prisma -v
```

`prisma`와 `@prisma/client` 버전이 일치하는지 확인합니다.

예시:

```text
prisma         : 7.9.0
@prisma/client : 7.9.0
```

### 주요 패키지

```bash
npm ls typescript express prisma @prisma/client tsoa --depth=0
```

---

## 🗄️ Prisma / DB 작업 규칙

Prisma Schema와 Migration은 팀 전체 개발 환경에 영향을 주므로 아래 규칙을 지킵니다.

### Schema 변경 전

- `prisma/schema.prisma` 수정이 필요한 경우 먼저 백엔드 팀에 변경 내용을 공유합니다.
- 다른 팀원이 동시에 Schema 또는 Migration을 수정하고 있는지 확인합니다.
- 최신 `dev`를 반영한 뒤 작업합니다.

```bash
git switch dev
git pull --ff-only origin dev
```

### 새로운 Schema 변경 작업

Schema 수정 후 새로운 Migration이 필요한 경우:

```bash
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

Migration 파일과 `schema.prisma`를 함께 커밋합니다.

### Migration 주의사항

- 이미 공유된 Migration 파일을 임의로 수정하거나 삭제하지 않습니다.
- 공용/배포 DB에서 `prisma migrate reset`을 사용하지 않습니다.
- Migration 충돌 또는 drift가 발생하면 임의로 초기화하지 말고 팀에 먼저 공유합니다.
- 서버 배포 환경에서는 기존 Migration 적용을 위해 `prisma migrate deploy`를 사용합니다.

---

## 🌿 브랜치 전략

```text
main
└── dev
    ├── feature/*
    ├── fix/*
    └── refactor/*
```

| 브랜치 | 용도 |
|---|---|
| `main` | 배포 브랜치 |
| `dev` | 개발 통합 브랜치 |
| `feature/*` | 새로운 기능 개발 |
| `fix/*` | 버그 및 오류 수정 |
| `refactor/*` | 기능 변경 없는 구조 개선 |

작업은 원칙적으로 `dev`에서 직접 진행하지 않고 목적에 맞는 작업 브랜치를 생성합니다.

예시:

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feature/task-result
```

이미 `dev`에서 수정한 내용이 커밋되지 않은 상태라면 새 브랜치를 생성해 현재 변경사항을 그대로 옮길 수 있습니다.

```bash
git switch -c fix/example
```

---

## 🧩 Git 작업 흐름

### 1. Issue 생성

기능 개발, 버그 수정, 리팩토링 등의 작업을 시작하기 전 관련 Issue를 생성합니다.

### 2. 최신 dev 반영

```bash
git switch dev
git pull --ff-only origin dev
```

### 3. 작업 브랜치 생성

```bash
git switch -c feature/<기능명>
```

또는:

```bash
git switch -c fix/<수정명>
git switch -c refactor/<작업명>
```

### 4. 작업 및 검증

최소한 아래 항목을 확인합니다.

```bash
npx prisma generate
npx tsc --noEmit
```

TSOA Controller 또는 API 명세가 변경된 경우:

```bash
npx tsoa spec-and-routes
```

### 5. Commit / Push

```bash
git add <변경 파일>
git commit -m "feat: 기능 설명"
git push -u origin <브랜치명>
```

### 6. PR 생성

작업 브랜치에서 `dev`를 대상으로 PR을 생성합니다.

---

## 🔖 커밋 컨벤션

커밋 메시지는 다음 형식을 사용합니다.

```text
<type>: <header>

<body>

<footer>
```

### Type

| Type | 설명 |
|---|---|
| `feat` | 새로운 기능 추가 또는 기능 변경 |
| `fix` | 버그 및 오류 수정 |
| `refactor` | 기능 변경 없는 코드 구조 개선 |
| `docs` | 문서 작성 및 수정 |
| `style` | 포맷팅, 세미콜론 등 코드 스타일 변경 |
| `test` | 테스트 코드 작성 및 수정 |
| `chore` | 설정 파일 및 기타 작업 |

### 작성 예시

```text
feat: 로그인 API 추가

JWT 기반 로그인 기능을 구현했습니다.

Closes #12
```

Header는 변경 내용을 알 수 있도록 간결하고 명확하게 작성합니다.

---

## 🔀 PR 컨벤션

### PR 대상 브랜치

```text
feature/*  ─┐
fix/*      ─┼─> dev
refactor/* ─┘

dev ─────────> main
```

### PR 제목

다음 형식을 사용합니다.

```text
[Feat] 로그인 API 구현
[Fix] 일지 상세 조회 Prisma relation 수정
[Refactor] 사용자 인증 로직 개선
```

### PR 본문

PR에는 최소한 다음 내용을 작성합니다.

- 작업 내용
- 주요 변경 사항
- 테스트 / 검증 결과
- Schema 또는 Migration 변경 여부
- 다른 기능이나 API에 영향을 주는 변경 사항

예시:

```md
## 🧩 작업 내용
- 일지 상세 조회 Prisma relation 수정

## 📌 변경 사항
- ReflectionSnapshot relation명을 현재 Prisma Schema와 일치하도록 수정

## 🗄️ DB / Migration
- Schema 변경 없음
- Migration 없음

## ✅ 테스트
- npx prisma generate
- npx tsc --noEmit
- TypeScript compile error 0건 확인
```

### Merge 규칙

- PR은 최소 1명의 Approve를 받은 뒤 Merge합니다.
- 리뷰에서 요청된 수정 사항과 Conversation을 해결한 뒤 Merge합니다.
- Merge 전 최신 `dev`와 충돌 여부를 확인합니다.
- 기본 Merge 방식은 **Squash and Merge**를 사용합니다.
- Merge 완료 후 작업 브랜치는 삭제합니다.

---

## ✅ PR 전 체크리스트

```text
[ ] 최신 dev를 기준으로 작업했는가?
[ ] 불필요한 파일이 포함되지 않았는가?
[ ] Prisma Schema 변경 시 팀에 공유했는가?
[ ] Migration이 필요한 변경인지 확인했는가?
[ ] npx prisma generate를 실행했는가?
[ ] npx tsc --noEmit 결과가 0 errors인가?
[ ] API 변경 시 TSOA spec/routes를 갱신했는가?
[ ] PR 본문에 변경 사항과 테스트 결과를 작성했는가?
```

---

## 📦 주요 npm scripts

| 명령어 | 설명 |
|---|---|
| `npm run dev` | TSOA spec/routes 생성 후 개발 서버 실행 |
| `npm run build` | TSOA spec/routes 생성 후 TypeScript 빌드 |
| `npm run start` | 빌드된 서버 실행 |
| `npm run prisma:generate` | Prisma Client 생성 |
| `npm run prisma:migrate` | Prisma 개발용 Migration 실행 |

---

## ⚠️ 주의사항

- `.env` 및 인증 정보는 Git에 커밋하지 않습니다.
- Schema, Migration, 공통 응답 구조, 인증 방식처럼 여러 모듈에 영향을 주는 변경은 작업 전 팀에 공유합니다.
- 배포 서버의 DB Migration을 임의로 초기화하지 않습니다.
- 생성 파일 또는 의존성 변경이 의도된 작업인지 `git status`, `git diff`로 확인한 뒤 Commit합니다.
