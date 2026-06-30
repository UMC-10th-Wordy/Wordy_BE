# Wordy Backend

Wordy 백엔드 리포지토리입니다.

---

## ⚙️ 기술 스택

- Node.js
- TypeScript
- Express
- ESLint
- Prettier

---

## 📁 프로젝트 구조

```text
.
├── modules
│   ├── auth
│   ├── users
│   ├── profiles
│   ├── projectTags
│   ├── tasks
│   │   ├── task.controller.ts
│   │   ├── task.service.ts
│   │   ├── task.repository.ts
│   │   ├── task.dto.ts
│   │   └── task.routes.ts
│   ├── dailyEntries
│   ├── ai
│   └── dashboard
│
├── common
│   ├── errors
│   ├── middlewares
│   ├── responses
│   ├── validators
│   └── utils
│
├── config
│   ├── env.config.ts
│   ├── db.config.ts
│   ├── auth.config.ts
│   └── ai.config.ts
│
├── app.ts
└── server.ts
```

---

# 🚀 실행 방법

### 패키지 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 프로덕션 실행
```bash
npm run start
```
> ⚠️ 참고
> - 실행 전 Node.js가 설치되어 있어야 합니다.
> - 'npm run build' 실행 시 'dist' 폴더가 생성됩니다.

---

# 📌 브랜치 전략
```text
main
 └── dev
      ├── feature/기능명
      ├── feature/기능명
```

- `main`: 배포 브랜치
- `dev`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치

---

# 🔖 커밋 컨벤션

커밋 메시지는 다음 형식을 따릅니다.

```text
<type>: <header>

<body>

<footer>
```

### Type

| Type | 설명 |
|------|------|
| feat | 새로운 기능 추가, 변경 |
| fix | 버그 수정 |
| refactor | 코드 리팩토링 |
| docs | 문서 작성 및 수정 |
| style | 코드 스타일 변경 (포맷팅, 세미콜론 등) |
| test | 테스트 코드 작성 및 수정 |
| chore | 설정 파일 및 기타 작업 |

### Header

- 커밋의 제목을 작성합니다.
- 간결하고 명확하게 작성합니다.

### Body (선택)

- 커밋에 대한 상세 설명을 작성합니다.
- Header만으로 충분하다면 생략 가능합니다.

### Footer (선택)

- 관련 이슈 번호 또는 참고 사항을 작성합니다.

### 예시

```text
feat: 로그인 API 추가

JWT 기반 로그인 기능을 구현했습니다.

Closes #12
```