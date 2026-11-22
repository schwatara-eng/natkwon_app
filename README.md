# 낱권

**키워드에서 시작해, 책 한 권을 만드는 AI 출판 웹앱.**

주인공 이름과 이야기 소재를 입력하고 분야를 고르면, AI가 기획과 원고를 만든다. 생성된 글은 분야별 판형으로 조판되어 표지와 본문을 웹에서 읽을 수 있다. 로그인하면 만든 책을 내 책장에 모아 두고, 미완성 원고나 그림을 이어서 만들 수 있다. 완성된 책은 PDF로 내려받을 수 있다.

[낱권 이용하기](https://natkwonapp.vercel.app/)

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
- **PDF 다운로드** — 마이페이지의 내 책장에서 완성된 책을 PDF로 저장한다. 표지·차례·본문 등을 열람 화면과 같은 조판으로 담으며, 만드는 동안 진행 쪽수를 표시한다.
- **히어로 배경 영상** — PC와 모바일에서 무음 자동재생을 시도한다. 자동재생이 차단되면 재생 버튼으로 시작할 수 있고, 움직임 줄이기·데이터 절약 설정에서는 정지 이미지를 표시한다.
- **관리자** — 회원과 책 목록, 기획 시작과 책 저장 집계, 일반 회원별 하루 한도를 관리한다. 오류·중단 기록은 Supabase에 기록용 테이블을 설정하면 확인할 수 있다.

## 완성된 책 PDF로 저장하기

1. Google 계정으로 로그인한 뒤 **마이페이지 → 내 책장**을 연다.
2. 완성된 책 카드의 **PDF 다운로드**를 누른다. 동화·그림책은 글과 그림을 모두 완성하면 버튼이 표시된다.
3. 쪽별 생성이 끝나면 책 제목을 파일명으로 한 PDF가 저장된다.

PDF는 장르별 판형으로 생성된다. 화면을 이미지로 담는 방식이어서 글자 선택·검색에는 제한이 있다. 그림을 불러오거나 PDF를 만드는 중 오류가 발생하면 안내 문구를 확인하고 다시 시도할 수 있다.

## 사용 기술

| 영역 | 구성 |
| --- | --- |
| 화면·조판 | HTML, CSS, JavaScript |
| 원고·삽화 생성 | Gemini, 선택적으로 Cloudflare Workers AI |
| 로그인·저장 | Supabase Auth, PostgreSQL, Storage |
| PDF 생성 | html2canvas, jsPDF |
| 서버·배포 | Node.js, Vercel 서버리스 API |

PDF 도구는 저장소의 `vendor/`에 포함되어 있으며, 다운로드 버튼을 누를 때 불러온다.

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
2. Supabase Auth에서 Google 로그인을 설정한다. **Authentication → URL Configuration**의 Redirect URLs에 로컬 주소 `http://localhost:3000/`와 배포 주소 `https://natkwonapp.vercel.app/`를 등록한다. 배포 서비스의 기본 로그인 복귀 주소인 Site URL은 `https://natkwonapp.vercel.app`로 설정한다.
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
| `vendor/` | PDF 생성 도구와 관련 라이선스 |

Vercel에서 실행할 때는 로컬과 같은 환경변수를 Vercel 프로젝트 설정에 등록한다.

## 연결 문제 확인

- 로그인 페이지에 접속되지 않으면 Supabase 대시보드에서 연결한 프로젝트의 상태를 확인한다. Paused 상태라면 Resume project로 복구한 뒤 다시 로그인한다.
- 로그인 후 로컬 주소로 이동하면 Supabase의 Site URL과 Redirect URLs에 배포 주소가 올바르게 등록되어 있는지 확인한다.
- 모바일에서 영상이 멈춰 있으면 재생 버튼을 누르고, 기기의 움직임 줄이기·데이터 절약 설정도 확인한다.

## 테스트

```powershell
node --test tests/books-admin.test.js tests/story-quality.test.js
```
