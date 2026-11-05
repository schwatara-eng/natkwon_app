# 낱권

**키워드에서 시작해, 책 한 권을 만드는 AI 출판 웹앱.**

주인공 이름과 이야기 소재를 입력하고 분야를 고르면, AI가 기획과 원고를 만든다. 생성된 글은 분야별 판형으로 조판되어 표지와 본문을 웹에서 읽을 수 있다. 로그인하면 만든 책을 내 책장에 모아 두고, 미완성 원고나 그림을 이어서 만들 수 있다.

## 만들 수 있는 책

| 분야 | 열람 화면의 판형 | 제작 흐름 |
| --- | --- | --- |
| 소설 | A5 148 × 210 mm | 1~2장을 먼저 읽고 나머지를 이어서 집필 |
| 에세이 | 사륙판 128 × 188 mm | 1인칭 산문 1~2편을 먼저 읽고 나머지를 이어서 집필 |
| 시 | 시집판 125 × 200 mm | 4편을 먼저 만들고 12편까지 완성 |
| 동화 | 135 × 195 mm | 이야기 설계·심사·집필·교정 후 표지와 장면 삽화 생성 |
| 그림책 | 정사각 215 × 215 mm | 글을 먼저 완성한 뒤 표지와 펼침면 삽화 생성 |

## 주요 기능

- **책 만들기** — 첫 화면에서 이름·소재·분야를 입력한다. 진행 단계가 표시되며, 중단한 작업은 저장된 단계부터 다시 시작할 수 있다.
- **책 미리보기** — 분야별 예시를 볼 수 있다. 열람 창에서는 한 면과 펼침면을 전환하고, 페이지 이동·확대·전체 화면을 사용할 수 있다.
- **내 책장** — Google 계정으로 로그인해 저장된 책을 읽고, 제목과 소개를 고치거나 미완성 책을 이어서 만든다.
- **관리자** — 회원과 책 목록, 기획 시작과 책 저장 집계, 일반 회원별 하루 한도를 관리한다. 오류·중단 기록은 Supabase에 기록용 테이블을 설정하면 확인할 수 있다.

## 로컬 실행

Node.js와 Git이 필요하다. 아래 명령을 VS Code 터미널에서 순서대로 실행한다. 별도의 패키지 설치나 빌드 과정은 없다.

```powershell
git clone https://github.com/schwatara-eng/natkwon_app.git
cd natkwon_app
node dev-server.js
```

터미널에 주소가 표시되면 [http://localhost:3000](http://localhost:3000)을 연다. 첫 화면과 예시 책을 먼저 확인할 수 있다. 로그인과 실제 책 생성은 아래 연결 설정을 마친 뒤 사용한다. 서버를 끄려면 터미널에서 `Ctrl+C`를 누른다.

### 로그인과 생성 연결

1. Supabase 프로젝트의 SQL Editor에서 [supabase-schema.sql](supabase-schema.sql)을 실행한다. 회원·책·생성 기록용 테이블과 삽화 저장용 공개 버킷 `book-images`가 만들어진다.
2. Supabase Auth에서 Google 로그인을 설정하고, 허용된 리디렉션 주소에 로컬 주소 `http://localhost:3000/`을 등록한다. 배포 환경을 사용한다면 해당 사이트 주소도 등록한다.
3. 프로젝트 폴더에 `.env.local`을 만들어 아래 항목에 각 프로젝트의 값을 넣는다. 저장한 뒤 서버를 다시 실행한다.

```dotenv
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 관리자 기능이 필요할 때 입력
ADMIN_EMAILS=
```

`ADMIN_EMAILS`에는 관리자 Google 계정 이메일을 넣는다. 여러 계정은 쉼표로 구분한다. `DEFAULT_DAILY_LIMIT`으로 일반 회원의 기본 한도를 바꿀 수 있으며, 기본값은 하루 3권이다. API 키와 서비스 역할 키는 서버 환경변수에만 두고 커밋하지 않는다.

글 생성에는 Gemini를 사용한다. 그림도 기본적으로 Gemini를 사용하며, Cloudflare Workers AI를 사용할 경우 `IMAGE_PROVIDER=cloudflare`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`을 설정한다.

이미 초기 스키마를 적용한 프로젝트에서 관리자 오류·중단 기록을 추가하려면 [20261104_generation_events.sql](migrations/20261104_generation_events.sql)을 한 번 실행한다.

## 코드 구성

| 경로 | 역할 |
| --- | --- |
| `index.html`, `style.css`, `script.js` | 책 만들기 화면, 조판과 열람, 내 책장과 관리자 화면 |
| `api/generate.js`, `api/_storylint.js` | 원고와 삽화 생성, 동화·그림책 설계 및 원고 검사 |
| `api/books.js`, `api/admin.js` | 저장과 열람, 계정과 관리자 기능 |
| `dev-server.js`, `vercel.json` | 로컬 실행과 Vercel 설정 |
| `images/`, `fonts/` | 이미지·영상과 웹 글꼴 |

Vercel에서 실행할 때는 로컬과 같은 환경변수를 Vercel 프로젝트 설정에 등록한다.

## 테스트

```powershell
node --test tests/books-admin.test.js tests/story-quality.test.js
```
