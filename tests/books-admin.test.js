const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");
const lib = require("../api/_lib.js");

const USER = "11111111-1111-4111-8111-111111111111";
const TICKET = "22222222-2222-4222-8222-222222222222";
const OTHER = "33333333-3333-4333-8333-333333333333";
const book = { title: "테스트 책", genre: "poem", outline: Array(12).fill("시"), chapters: Array(4).fill({ text: "본문" }) };

function fresh(path) {
  delete require.cache[require.resolve(path)];
  return require(path);
}

function response() {
  return {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; },
  };
}

afterEach(() => mock.restoreAll());

test("저장 후 완료 표시 갱신이 실패해도 재시도 시 같은 책을 반환한다", async () => {
  const books = new Map();
  let failMarker = true;
  mock.method(lib, "db", async (path, options = {}) => {
    if (path.startsWith("generations?")) {
      if (failMarker) { failMarker = false; throw new Error("connection"); }
      return null;
    }
    if (options.method === "POST") {
      if (!books.has(options.body.id)) books.set(options.body.id, options.body);
      return null;
    }
    return books.has(TICKET) ? [{ id: TICKET, data: books.get(TICKET).data }] : [];
  });
  const { saveBook } = fresh("../api/_books.js");
  await assert.rejects(saveBook(USER, TICKET, book));
  const result = await saveBook(USER, TICKET, { ...book, title: "다시 생성한 제목" });
  assert.equal(books.size, 1);
  assert.equal(result.id, TICKET);
  assert.equal(result.book.title, "테스트 책");
});

test("동시에 저장해도 한 권만 만들고 기존 데이터를 덮어쓰지 않는다", async () => {
  const books = new Map();
  mock.method(lib, "db", async (path, options = {}) => {
    if (path.startsWith("generations?")) return null;
    if (options.method === "POST") {
      assert.equal(options.prefer, "resolution=ignore-duplicates,return=minimal");
      if (!books.has(TICKET)) books.set(TICKET, options.body.data);
      return null;
    }
    return books.has(TICKET) ? [{ id: TICKET, data: books.get(TICKET) }] : [];
  });
  const { saveBook } = fresh("../api/_books.js");
  const saved = await Promise.all([saveBook(USER, TICKET, book), saveBook(USER, TICKET, book)]);
  assert.equal(books.size, 1);
  assert.equal(saved[0].id, saved[1].id);
});

test("책 삽입 자체가 실패해도 다시 저장할 수 있다", async () => {
  let attempts = 0;
  let saved = null;
  mock.method(lib, "db", async (path, options = {}) => {
    if (path.startsWith("generations?")) return null;
    if (options.method === "POST") {
      if (++attempts === 1) throw new Error("offline");
      saved = options.body;
      return null;
    }
    return saved ? [{ id: saved.id, data: saved.data }] : [];
  });
  const { saveBook } = fresh("../api/_books.js");
  await assert.rejects(saveBook(USER, TICKET, book));
  assert.equal((await saveBook(USER, TICKET, book)).id, TICKET);
  assert.equal(attempts, 2);
});

test("시와 그림책의 진행 상태를 목록용 정보로 반환한다", () => {
  const { bookProgress } = fresh("../api/_books.js");
  assert.deepEqual(bookProgress(book), { done: false, text: "본문 4/12편 완성", action: "이어서 만들기" });
  const picture = { coverArt: true, spreads: [{ image: "scene" }], coverImage: "cover", plan: { ref: "reference" } };
  assert.equal(bookProgress(picture).done, true);
  delete picture.coverImage;
  assert.equal(bookProgress(picture).text, "글 완성 · 그림 2/3장");
  assert.equal(bookProgress({ chapters: [{}], outline: ["완성"] }).done, true);
});

test("DB 페이지 제한을 넘는 1201행을 모두 읽는다", async () => {
  const rows = Array.from({ length: 1201 }, (_, id) => ({ id }));
  const previous = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://test.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test";
  mock.method(global, "fetch", async (url) => {
    const query = new URL(url).searchParams;
    const offset = Number(query.get("offset"));
    const limit = Number(query.get("limit"));
    return { ok: true, text: async () => JSON.stringify(rows.slice(offset, offset + limit)) };
  });
  try {
    assert.equal((await lib.dbAll("books?select=id&order=id")).length, 1201);
  } finally {
    if (previous === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previous;
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

function adminMocks(admin = true) {
  mock.method(lib, "configured", () => true);
  mock.method(lib, "getUser", async () => ({ id: USER, email: "admin@example.test" }));
  mock.method(lib, "isAdmin", (user) => admin && user.email === "admin@example.test");
  mock.method(lib, "defaultLimit", () => 3);
}

test("회원별 권수는 최근 200권 목록과 별도로 전체 1201권을 집계한다", async () => {
  adminMocks();
  const now = new Date().toISOString();
  mock.method(lib, "dbAll", async (path) => {
    if (path.startsWith("profiles?")) return [{ id: USER, email: "admin@example.test", created_at: now, daily_limit: 3 }];
    if (path.startsWith("books?")) return Array.from({ length: 1201 }, (_, id) => ({ id: String(id), user_id: USER, created_at: now }));
    return [{ id: TICKET, user_id: USER, created_at: now, book_id: null, saved: false }];
  });
  mock.method(lib, "db", async (path, options = {}) => {
    if (path.startsWith("generation_events?")) return options.count ? { total: 0 } : [];
    return [];
  });
  const handler = fresh("../api/admin.js");
  const res = response();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.stats.books, 1201);
  assert.equal(res.data.users[0].books, 1201);
  assert.equal(res.data.users[0].effectiveLimit, null);
  assert.equal(res.data.activity.unresolved.length, 1);
});

test("일반 회원은 관리자 데이터를 조회할 수 없다", async () => {
  adminMocks(false);
  const db = mock.method(lib, "db", async () => assert.fail("DB must not be read"));
  const handler = fresh("../api/admin.js");
  const res = response();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(db.mock.callCount(), 0);
});

test("관리자 무제한은 한도 수정으로 변경되지 않는다", async () => {
  adminMocks();
  mock.method(lib, "db", async () => [{ id: USER, email: "admin@example.test" }]);
  const handler = fresh("../api/admin.js");
  const res = response();
  await handler({ method: "PATCH", body: { userId: USER, dailyLimit: 2 } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.error, "admin_unlimited");
});

test("다른 회원의 생성 기록으로 책을 저장할 수 없다", async () => {
  adminMocks(false);
  mock.method(lib, "db", async (path) => {
    assert.ok(path.includes(`user_id=eq.${USER}`));
    return [];
  });
  fresh("../api/_books.js");
  fresh("../api/_activity.js");
  const handler = fresh("../api/books.js");
  const res = response();
  await handler({ method: "POST", query: {}, body: { ticket: OTHER, book } }, res);
  assert.equal(res.statusCode, 404);
});

test("이력 테이블이 없어도 기본 관리자 화면은 정상 응답한다", async () => {
  adminMocks();
  mock.method(lib, "dbAll", async () => []);
  mock.method(lib, "db", async (path) => {
    if (path.startsWith("generation_events")) throw new Error("missing table");
    return [];
  });
  const handler = fresh("../api/admin.js");
  const res = response();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.activity.available, false);
  assert.equal(res.data.stats.issuesToday, null);
});

test("이력 저장 실패는 생성 응답을 실패로 바꾸지 않는다", async () => {
  mock.method(lib, "db", async () => { throw new Error("missing table"); });
  mock.method(console, "error", () => {});
  const { sendActivity } = fresh("../api/_activity.js");
  const res = response();
  res.generationActivity = { userId: USER, step: "chapter", ticket: TICKET };
  await sendActivity(res, 200, { text: "완료" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.data, { text: "완료" });
});

test("예전 저장 완료 표시만 남은 기록도 실제 책을 저장하고 ID를 돌려준다", async () => {
  adminMocks(false);
  let stored = null;
  mock.method(lib, "db", async (path, options = {}) => {
    if (path === "generation_events") return null;
    if (path.startsWith("generations?")) {
      return options.method === "PATCH" ? null : [{ id: TICKET, saved: true, book_id: null }];
    }
    if (options.method === "POST") {
      stored = options.body;
      return null;
    }
    return stored ? [{ id: stored.id, data: stored.data }] : [];
  });
  fresh("../api/_books.js");
  fresh("../api/_activity.js");
  const handler = fresh("../api/books.js");
  const res = response();
  await handler({ method: "POST", query: {}, body: { ticket: TICKET, book } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.id, TICKET);
  assert.equal(res.data.book.title, book.title);
});

test("오류 이력에는 원고 대신 단계와 오류 코드만 기록한다", async () => {
  let event;
  mock.method(lib, "db", async (path, options) => { event = options.body; });
  const { sendActivity } = fresh("../api/_activity.js");
  const res = response();
  res.generationActivity = { userId: USER, ticket: TICKET, step: "chapter" };
  await sendActivity(res, 503, { error: "busy", text: "저장하면 안 되는 원고" });
  assert.equal(event.outcome, "failed");
  assert.equal(event.error_code, "busy");
  assert.equal(event.step, "chapter");
  assert.equal(JSON.stringify(event).includes("원고"), false);
  assert.equal(res.statusCode, 503);
});
